import pool from '../config/database.js';
import { SemesterCalendarModel } from '../models/semesterCalendarModel.js';
import { StatsService } from './statsService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Backup & Restore Service - Handles JSON data export, validation, deduplication, and database restoration.
 */
export const BackupService = {
  /**
   * Export all database tables into a structured JSON backup payload
   * @returns {Promise<Object>} Export JSON object
   */
  async exportBackup() {
    await SemesterCalendarModel.ensureTablesExist();

    const [subjects] = await pool.query('SELECT * FROM subjects ORDER BY id ASC');
    const [semesterConfig] = await pool.query('SELECT * FROM semester_config ORDER BY id ASC');
    const [calendarEvents] = await pool.query('SELECT * FROM calendar_events ORDER BY id ASC');
    const [lectureSchedule] = await pool.query(`
      SELECT 
        id, subject_id, DATE_FORMAT(lecture_date, "%Y-%m-%d") as lecture_date,
        lecture_start, lecture_end, lecture_status, created_at
      FROM lecture_schedule
      ORDER BY id ASC
    `);
    const [attendanceRecords] = await pool.query('SELECT * FROM attendance_records ORDER BY id ASC');

    const formattedEvents = calendarEvents.map(e => ({
      ...e,
      start_date: e.start_date ? new Date(e.start_date).toISOString().split('T')[0] : null,
      end_date: e.end_date ? new Date(e.end_date).toISOString().split('T')[0] : null,
    }));

    const formattedSemesterConfig = semesterConfig.map(sc => ({
      ...sc,
      start_date: sc.start_date ? new Date(sc.start_date).toISOString().split('T')[0] : null,
      end_date: sc.end_date ? new Date(sc.end_date).toISOString().split('T')[0] : null,
    }));

    const nowIso = new Date().toISOString();

    return {
      app: 'AttendAI',
      version: '1.0',
      exportedAt: nowIso,
      metadata: {
        subjectsCount: subjects.length,
        semesterConfigCount: semesterConfig.length,
        calendarEventsCount: calendarEvents.length,
        lectureScheduleCount: lectureSchedule.length,
        attendanceRecordsCount: attendanceRecords.length,
      },
      data: {
        subjects,
        semesterConfig: formattedSemesterConfig,
        calendarEvents: formattedEvents,
        lectureSchedule,
        attendanceRecords,
      },
    };
  },

  /**
   * Validate backup JSON payload schema
   * @param {Object} backup 
   * @returns {{ valid: boolean, errors: Array<string> }}
   */
  validateBackupData(backup) {
    const errors = [];
    if (!backup || typeof backup !== 'object') {
      return { valid: false, errors: ['Invalid backup file format: Payload is empty or not a valid JSON object.'] };
    }

    const payloadData = backup.data || backup;

    if (!payloadData.subjects || !Array.isArray(payloadData.subjects)) {
      errors.push('Missing or invalid "subjects" array in backup data.');
    }

    if (!payloadData.lectureSchedule || !Array.isArray(payloadData.lectureSchedule)) {
      errors.push('Missing or invalid "lectureSchedule" array in backup data.');
    }

    if (!payloadData.attendanceRecords || !Array.isArray(payloadData.attendanceRecords)) {
      errors.push('Missing or invalid "attendanceRecords" array in backup data.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Import backup data into MySQL database with validation, transactional safety, and duplicate prevention
   * @param {Object} backupData - Backup JSON payload
   * @param {Object} [options={}]
   * @param {boolean} [options.overwrite=false] - True to clear existing data before restoring
   * @returns {Promise<Object>} Import summary
   */
  async importBackup(backupData, options = {}) {
    await SemesterCalendarModel.ensureTablesExist();

    const { overwrite = false } = options;

    // 1. Validate Payload Schema
    const validation = this.validateBackupData(backupData);
    if (!validation.valid) {
      throw new AppError(`Backup validation failed: ${validation.errors.join(' ')}`, 400);
    }

    const payload = backupData.data || backupData;
    const {
      subjects = [],
      semesterConfig = [],
      calendarEvents = [],
      lectureSchedule = [],
      attendanceRecords = [],
    } = payload;

    const conn = await pool.getConnection();
    let subjectsImported = 0;
    let semesterConfigImported = 0;
    let calendarEventsImported = 0;
    let lectureScheduleImported = 0;
    let attendanceRecordsImported = 0;
    let duplicatesSkipped = 0;

    try {
      await conn.beginTransaction();

      // If overwrite is selected, clear existing data in correct FK order
      if (overwrite) {
        await conn.query('DELETE FROM attendance_records');
        await conn.query('DELETE FROM lecture_schedule');
        await conn.query('DELETE FROM calendar_events');
        await conn.query('DELETE FROM semester_config');
        await conn.query('DELETE FROM subjects');
      }

      // Map to track old subject IDs -> new subject IDs if subject IDs change during merge
      const subjectIdMap = new Map();

      // 2. Process Subjects
      for (const sub of subjects) {
        if (!sub.subject_name) continue;

        // Check duplicate by subject_name
        const [existing] = await conn.query(
          'SELECT id FROM subjects WHERE LOWER(subject_name) = LOWER(?)',
          [sub.subject_name]
        );

        if (existing.length > 0) {
          subjectIdMap.set(sub.id, existing[0].id);
          duplicatesSkipped++;
        } else {
          const [res] = await conn.query(
            'INSERT INTO subjects (subject_name, faculty_name, color) VALUES (?, ?, ?)',
            [sub.subject_name, sub.faculty_name || '', sub.color || '#6366f1']
          );
          subjectIdMap.set(sub.id, res.insertId);
          subjectsImported++;
        }
      }

      // 3. Process Semester Configuration
      for (const sc of semesterConfig) {
        if (!sc.start_date || !sc.end_date) continue;
        const [existing] = await conn.query(
          'SELECT id FROM semester_config WHERE start_date = ? AND end_date = ?',
          [sc.start_date, sc.end_date]
        );
        if (existing.length > 0) {
          duplicatesSkipped++;
        } else {
          await conn.query('UPDATE semester_config SET is_active = FALSE');
          await conn.query(
            'INSERT INTO semester_config (semester_name, start_date, end_date, is_active) VALUES (?, ?, ?, TRUE)',
            [sc.semester_name || 'Current Semester', sc.start_date, sc.end_date]
          );
          semesterConfigImported++;
        }
      }

      // 4. Process Calendar Events
      for (const evt of calendarEvents) {
        if (!evt.event_name || !evt.start_date) continue;
        const [existing] = await conn.query(
          'SELECT id FROM calendar_events WHERE event_name = ? AND start_date = ?',
          [evt.event_name, evt.start_date]
        );
        if (existing.length > 0) {
          duplicatesSkipped++;
        } else {
          await conn.query(
            'INSERT INTO calendar_events (semester_id, event_type, event_name, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
            [
              evt.semester_id || 1,
              evt.event_type || 'holiday',
              evt.event_name,
              evt.start_date,
              evt.end_date || evt.start_date,
              evt.description || null,
            ]
          );
          calendarEventsImported++;
        }
      }

      // Map to track old lecture IDs -> new lecture IDs
      const lectureIdMap = new Map();

      // 5. Process Lecture Schedule
      for (const lec of lectureSchedule) {
        const mappedSubjectId = subjectIdMap.get(lec.subject_id) || lec.subject_id;
        if (!mappedSubjectId || !lec.lecture_date) continue;

        // Check duplicate by subject_id, lecture_date, and lecture_start
        const [existing] = await conn.query(
          'SELECT id FROM lecture_schedule WHERE subject_id = ? AND lecture_date = ? AND lecture_start = ?',
          [mappedSubjectId, lec.lecture_date, lec.lecture_start]
        );

        if (existing.length > 0) {
          lectureIdMap.set(lec.id, existing[0].id);
          duplicatesSkipped++;
        } else {
          const [res] = await conn.query(
            `INSERT INTO lecture_schedule 
             (subject_id, lecture_date, lecture_start, lecture_end, lecture_status)
             VALUES (?, ?, ?, ?, ?)`,
            [
              mappedSubjectId,
              lec.lecture_date,
              lec.lecture_start,
              lec.lecture_end,
              lec.lecture_status || 'scheduled',
            ]
          );
          lectureIdMap.set(lec.id, res.insertId);
          lectureScheduleImported++;
        }
      }

      // 6. Process Attendance Records
      for (const ar of attendanceRecords) {
        const mappedLectureId = lectureIdMap.get(ar.lecture_id) || ar.lecture_id;
        if (!mappedLectureId || !ar.attendance_status) continue;

        // Check duplicate by lecture_id
        const [existing] = await conn.query(
          'SELECT id FROM attendance_records WHERE lecture_id = ?',
          [mappedLectureId]
        );

        if (existing.length > 0) {
          // Update status if present
          await conn.query(
            'UPDATE attendance_records SET attendance_status = ? WHERE lecture_id = ?',
            [ar.attendance_status, mappedLectureId]
          );
          duplicatesSkipped++;
        } else {
          await conn.query(
            'INSERT INTO attendance_records (lecture_id, attendance_status) VALUES (?, ?)',
            [mappedLectureId, ar.attendance_status]
          );
          attendanceRecordsImported++;
        }
      }

      await conn.commit();
      StatsService.invalidateCache();

      return {
        mode: overwrite ? 'overwrite' : 'merge',
        summary: {
          subjectsImported,
          semesterConfigImported,
          calendarEventsImported,
          lectureScheduleImported,
          attendanceRecordsImported,
          duplicatesSkipped,
          totalRecordsProcessed:
            subjects.length +
            semesterConfig.length +
            calendarEvents.length +
            lectureSchedule.length +
            attendanceRecords.length,
        },
        message: overwrite
          ? 'Database successfully restored from backup (overwrite mode).'
          : `Backup merged successfully. ${attendanceRecordsImported + lectureScheduleImported} new items added, ${duplicatesSkipped} duplicates skipped.`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
