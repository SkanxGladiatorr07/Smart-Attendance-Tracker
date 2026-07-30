import pool from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { isTimeRangeValid } from '../utils/dateUtils.js';
import { SemesterCalendarModel } from '../models/semesterCalendarModel.js';

const SUBJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', 
  '#10b981', '#f59e0b', '#06b6d4', '#84cc16'
];

/**
 * AI Schedule Service - Complete semester schedule generation engine with MySQL bulk transaction optimization.
 */
export const AIScheduleService = {
  /**
   * Checks if lecture schedules already exist within date range
   * @param {string} startDate YYYY-MM-DD
   * @param {string} endDate YYYY-MM-DD
   * @returns {Promise<{ hasDuplicate: boolean, count: number }>}
   */
  async checkDuplicateSemesterSchedule(startDate, endDate) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM lecture_schedule WHERE lecture_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    const count = rows[0]?.count || 0;
    return {
      hasDuplicate: count > 0,
      count
    };
  },

  /**
   * Clears existing lecture schedules in date range (Atomic reset for re-import)
   * @param {string} startDate YYYY-MM-DD
   * @param {string} endDate YYYY-MM-DD
   * @returns {Promise<number>} Count of deleted lectures
   */
  async clearSemesterScheduleInRange(startDate, endDate) {
    const [result] = await pool.query(
      'DELETE FROM lecture_schedule WHERE lecture_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    return result.affectedRows || 0;
  },

  /**
   * Validates list of lecture objects for time slot overlaps
   */
  validateScheduleConflicts(lectures = []) {
    const conflicts = [];

    for (let i = 0; i < lectures.length; i++) {
      const a = lectures[i];
      if (!isTimeRangeValid(a.lecture_start, a.lecture_end)) {
        conflicts.push({
          index: i,
          reason: `Invalid time range: start time (${a.lecture_start}) must be before end time (${a.lecture_end})`,
        });
      }

      for (let j = i + 1; j < lectures.length; j++) {
        const b = lectures[j];
        if (
          a.subject_id === b.subject_id &&
          a.lecture_date === b.lecture_date
        ) {
          if (
            a.lecture_start < b.lecture_end &&
            b.lecture_start < a.lecture_end
          ) {
            conflicts.push({
              indices: [i, j],
              reason: `Overlapping lecture slot for subject ${a.subject_id} on ${a.lecture_date}`,
            });
          }
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
    };
  },

  /**
   * Generates complete semester schedule from Academic Calendar & Weekly Timetable,
   * bulk inserting records into MySQL `lecture_schedule` and `attendance_records` (status 'pending').
   * @param {Object} params 
   * @param {Object} params.calendar - { semesterStart, semesterEnd, holidays, workingSaturdays, examPeriods }
   * @param {Object} params.timetable - { Monday: [...], Tuesday: [...], ... Saturday: [...] }
   * @param {boolean} [params.overwrite=false] - Whether to overwrite existing schedule if duplicate exists
   * @returns {Promise<Object>} Generation statistics
   */
  async generateCompleteSemesterSchedule({ calendar, timetable, overwrite = false }) {
    const startTimeMs = Date.now();

    if (!calendar || !calendar.semesterStart || !calendar.semesterEnd) {
      throw new AppError('Valid Academic Calendar with semesterStart and semesterEnd is required.', 400);
    }
    if (!timetable || typeof timetable !== 'object') {
      throw new AppError('Valid Weekly Timetable schedule is required.', 400);
    }

    const startDate = new Date(calendar.semesterStart);
    const endDate = new Date(calendar.semesterEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      throw new AppError('Invalid semester start or end date range.', 400);
    }

    const startStr = calendar.semesterStart;
    const endStr = calendar.semesterEnd;

    // Check for duplicate semester import
    const dupCheck = await this.checkDuplicateSemesterSchedule(startStr, endStr);
    if (dupCheck.hasDuplicate && !overwrite) {
      const err = new AppError(
        `Existing semester schedule detected (${dupCheck.count} lectures found between ${startStr} and ${endStr}). Please confirm overwrite to proceed.`,
        409
      );
      err.code = 'DUPLICATE_SEMESTER_SCHEDULE';
      err.duplicateCount = dupCheck.count;
      throw err;
    }

    // 1. Resolve & Provision Subjects in MySQL Database
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const uniqueSubjectNames = new Set();

    days.forEach((day) => {
      if (Array.isArray(timetable[day])) {
        timetable[day].forEach((lec) => {
          if (lec && lec.subject) {
            uniqueSubjectNames.add(lec.subject.trim());
          }
        });
      }
    });

    if (uniqueSubjectNames.size === 0) {
      throw new AppError('No valid subjects found in weekly timetable.', 400);
    }

    // Query existing subjects from DB
    const [existingSubjects] = await pool.query('SELECT id, subject_name FROM subjects');
    const subjectMap = new Map();

    existingSubjects.forEach((sub) => {
      subjectMap.set(sub.subject_name.toLowerCase(), sub.id);
    });

    // Auto-create missing subjects
    let colorIdx = 0;
    for (const name of uniqueSubjectNames) {
      if (!subjectMap.has(name.toLowerCase())) {
        const color = SUBJECT_COLORS[colorIdx % SUBJECT_COLORS.length];
        colorIdx++;
        const [res] = await pool.query(
          'INSERT INTO subjects (subject_name, faculty_name, color) VALUES (?, ?, ?)',
          [name, 'Faculty Member', color]
        );
        subjectMap.set(name.toLowerCase(), res.insertId);
      }
    }

    // 2. Prepare Lookup Data Structures for Date Filtering
    const holidayDatesSet = new Set(
      (calendar.holidays || []).map((h) => h.date).filter(Boolean)
    );

    const workingSaturdaysMap = new Map(
      (calendar.workingSaturdays || []).map((ws) => [ws.date, ws.description || 'Working Saturday'])
    );

    const examPeriods = calendar.examPeriods || [];

    // Helper functions
    const formatDateIso = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayStr}`;
    };

    const getDayName = (d) => [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ][d.getDay()];

    const formatTime = (t) => {
      if (!t) return '09:00:00';
      const parts = t.split(':');
      if (parts.length === 2) return `${t}:00`;
      return t;
    };

    const isDateInExamPeriod = (dateStr) => {
      return examPeriods.some((exam) => {
        if (!exam.startDate || !exam.endDate) return false;
        return dateStr >= exam.startDate && dateStr <= exam.endDate;
      });
    };

    // 3. Iterate Day-by-Day across Semester Date Range
    const lecturesToInsert = [];
    const lecturesPerSubject = {};
    let workingDaysCount = 0;

    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = formatDateIso(current);
      const dayName = getDayName(current);

      // Check 1: Skip Holidays
      if (holidayDatesSet.has(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Check 2: Skip Exam Periods
      if (isDateInExamPeriod(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Check 3: Skip Sundays
      if (dayName === 'Sunday') {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Check 4: Handle Saturdays
      let effectiveDay = dayName;
      if (dayName === 'Saturday') {
        if (!workingSaturdaysMap.has(dateStr)) {
          // Non-working Saturday -> skip
          current.setDate(current.getDate() + 1);
          continue;
        }

        const desc = workingSaturdaysMap.get(dateStr) || '';
        const matchedDay = days.find((d) => desc.toLowerCase().includes(d.toLowerCase()));
        if (matchedDay) {
          effectiveDay = matchedDay;
        }
      }

      // Valid working day
      workingDaysCount++;

      const dayLectures = timetable[effectiveDay] || [];
      dayLectures.forEach((lec) => {
        const subName = lec.subject?.trim();
        const subId = subjectMap.get(subName?.toLowerCase());

        if (subId) {
          const startTime = formatTime(lec.startTime);
          const endTime = formatTime(lec.endTime);

          lecturesToInsert.push([
            subId,
            dateStr,
            startTime,
            endTime,
            'scheduled'
          ]);

          lecturesPerSubject[subName] = (lecturesPerSubject[subName] || 0) + 1;
        }
      });

      current.setDate(current.getDate() + 1);
    }

    // 4. Perform Bulk MySQL Transaction Insert (Optimized for large semesters)
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Persist active semester calendar configuration & calendar events in database
      await SemesterCalendarModel.saveSemesterCalendar(calendar, connection);

      // Clear existing records if overwrite mode enabled
      if (overwrite && dupCheck.hasDuplicate) {
        await connection.query(
          'DELETE FROM lecture_schedule WHERE lecture_date BETWEEN ? AND ?',
          [startStr, endStr]
        );
      }

      const insertedLectureIds = [];
      const chunkSize = 500;

      // Bulk insert into `lecture_schedule` table
      for (let i = 0; i < lecturesToInsert.length; i += chunkSize) {
        const chunk = lecturesToInsert.slice(i, i + chunkSize);
        const [result] = await connection.query(
          `INSERT INTO lecture_schedule (subject_id, lecture_date, lecture_start, lecture_end, lecture_status) VALUES ?`,
          [chunk]
        );

        const firstId = result.insertId;
        const count = result.affectedRows;
        for (let id = firstId; id < firstId + count; id++) {
          insertedLectureIds.push(id);
        }
      }

      // Bulk insert into `attendance_records` table with status 'pending'
      if (insertedLectureIds.length > 0) {
        const attendanceRows = insertedLectureIds.map((id) => [id, 'pending']);
        for (let i = 0; i < attendanceRows.length; i += chunkSize) {
          const chunk = attendanceRows.slice(i, i + chunkSize);
          await connection.query(
            `INSERT INTO attendance_records (lecture_id, attendance_status) VALUES ?`,
            [chunk]
          );
        }
      }

      await connection.commit();

      const elapsedTimeMs = Date.now() - startTimeMs;

      return {
        status: 'success',
        message: 'Complete semester schedule generated and stored successfully.',
        statistics: {
          workingDays: workingDaysCount,
          subjects: uniqueSubjectNames.size,
          totalLectures: lecturesToInsert.length,
          lecturesPerSubject,
          generationTimeMs: elapsedTimeMs
        }
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
};
