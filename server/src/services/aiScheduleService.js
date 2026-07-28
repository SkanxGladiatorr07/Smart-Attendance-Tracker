import pool from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { isTimeRangeValid } from '../utils/dateUtils.js';

/**
 * AI Schedule Service - Architecture & interface for AI-generated semester schedule generation.
 * Handles timetable parsing, conflict detection, and bulk semester lecture expansion.
 */
export const AIScheduleService = {
  /**
   * Validates list of lecture objects for time slot overlaps
   * @param {Array<Object>} lectures - List of proposed lecture objects
   * @returns {Object} { isValid: boolean, conflicts: Array<Object> }
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
          // Check overlap: startA < endB AND startB < endA
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
   * Expands weekly schedule pattern across semester start_date and end_date
   * @param {Object} params - Generation parameters
   * @param {Array<Object>} params.weeklyPattern - Weekly recurring slots [{ subject_id, dayOfWeek (0-6), lecture_start, lecture_end }]
   * @param {string} params.startDate - Semester start date YYYY-MM-DD
   * @param {string} params.endDate - Semester end date YYYY-MM-DD
   * @returns {Array<Object>} Array of expanded daily lecture schedule objects
   */
  expandSemesterSchedule({ weeklyPattern = [], startDate, endDate }) {
    if (!startDate || !endDate || weeklyPattern.length === 0) {
      throw new AppError('startDate, endDate, and weeklyPattern are required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      throw new AppError('Invalid semester date range', 400);
    }

    const expandedLectures = [];
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dateStr = current.toISOString().split('T')[0];

      const matchingSlots = weeklyPattern.filter((slot) => slot.dayOfWeek === dayOfWeek);

      matchingSlots.forEach((slot) => {
        expandedLectures.push({
          subject_id: slot.subject_id,
          lecture_date: dateStr,
          lecture_start: slot.lecture_start,
          lecture_end: slot.lecture_end,
          lecture_status: slot.lecture_status || 'scheduled',
        });
      });

      current.setDate(current.getDate() + 1);
    }

    return expandedLectures;
  },

  /**
   * Bulk inserts generated semester schedule entries into lecture_schedule table inside a SQL transaction
   * @param {Array<Object>} lecturesList - Expanded list of lecture objects
   * @returns {Promise<{ createdCount: number }>} Result summary
   */
  async bulkCreateLectures(lecturesList = []) {
    if (lecturesList.length === 0) {
      return { createdCount: 0 };
    }

    const conflictCheck = this.validateScheduleConflicts(lecturesList);
    if (!conflictCheck.isValid) {
      throw new AppError(
        `Schedule conflicts detected: ${conflictCheck.conflicts.map((c) => c.reason).join('; ')}`,
        400
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let createdCount = 0;
      for (const lec of lecturesList) {
        await connection.query(
          `INSERT INTO lecture_schedule (subject_id, lecture_date, lecture_start, lecture_end, lecture_status)
           VALUES (?, ?, ?, ?, ?)`,
          [
            lec.subject_id,
            lec.lecture_date,
            lec.lecture_start,
            lec.lecture_end,
            lec.lecture_status || 'scheduled',
          ]
        );
        createdCount++;
      }

      await connection.commit();
      return { createdCount };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  /**
   * Architecture Stub for AI Prompt Parsing (e.g. from Gemini or OpenAI prompt)
   * @param {string} promptText - User timetable prompt or OCR text
   * @returns {Promise<Object>} Structured weekly pattern
   */
  async parseAITimetablePrompt(_promptText) {
    // Architecture stub interface for future AI provider integration
    return {
      status: 'success',
      message: 'AI Schedule Parser Interface Ready for LLM integration',
      weeklyPattern: [],
    };
  },
};
