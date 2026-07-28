import pool from '../config/database.js';
import { validateLectureSchedule } from '../utils/validators.js';

/**
 * LectureSchedule Model - Handles SQL database queries for the `lecture_schedule` table.
 */
export const LectureScheduleModel = {
  /**
   * Fetch all lecture schedules with optional filters
   * @param {Object} [filters] - Filter options
   * @param {number|string} [filters.subject_id] - Subject ID filter
   * @param {string} [filters.lecture_date] - Date YYYY-MM-DD filter
   * @param {string} [filters.start_date] - Date range start filter
   * @param {string} [filters.end_date] - Date range end filter
   * @param {string} [filters.lecture_status] - Status ('scheduled'|'cancelled'|'extra')
   * @returns {Promise<Array<Object>>} Array of lecture schedule records with subject metadata
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT 
        ls.id, ls.subject_id, ls.lecture_date, ls.lecture_start, ls.lecture_end, ls.lecture_status, ls.created_at,
        s.subject_name, s.faculty_name, s.color
      FROM lecture_schedule ls
      JOIN subjects s ON ls.subject_id = s.id
    `;
    const conditions = [];
    const params = [];

    if (filters.subject_id) {
      conditions.push('ls.subject_id = ?');
      params.push(filters.subject_id);
    }

    if (filters.lecture_date) {
      conditions.push('ls.lecture_date = ?');
      params.push(filters.lecture_date);
    }

    if (filters.start_date && filters.end_date) {
      conditions.push('ls.lecture_date BETWEEN ? AND ?');
      params.push(filters.start_date, filters.end_date);
    }

    if (filters.lecture_status) {
      conditions.push('ls.lecture_status = ?');
      params.push(filters.lecture_status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY ls.lecture_date DESC, ls.lecture_start ASC';

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /**
   * Find a lecture schedule by ID
   * @param {number|string} id - Lecture schedule ID
   * @returns {Promise<Object|null>} Lecture schedule record or null
   */
  async findById(id) {
    const sql = `
      SELECT 
        ls.id, ls.subject_id, ls.lecture_date, ls.lecture_start, ls.lecture_end, ls.lecture_status, ls.created_at,
        s.subject_name, s.faculty_name, s.color
      FROM lecture_schedule ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ls.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Find all lecture schedules by subject ID
   * @param {number|string} subjectId - Subject ID
   * @returns {Promise<Array<Object>>} Array of lecture schedules
   */
  async findBySubjectId(subjectId) {
    return this.findAll({ subject_id: subjectId });
  },

  /**
   * Create a new lecture schedule entry
   * @param {Object} data - Schedule creation data
   * @param {number} data.subject_id - Subject ID
   * @param {string} data.lecture_date - YYYY-MM-DD Date
   * @param {string} data.lecture_start - HH:MM:SS Start time
   * @param {string} data.lecture_end - HH:MM:SS End time
   * @param {string} [data.lecture_status='scheduled'] - Status
   * @returns {Promise<Object>} Created lecture schedule record
   */
  async create({ subject_id, lecture_date, lecture_start, lecture_end, lecture_status = 'scheduled' }) {
    validateLectureSchedule({ subject_id, lecture_date, lecture_start, lecture_end, lecture_status });

    const [result] = await pool.query(
      `INSERT INTO lecture_schedule (subject_id, lecture_date, lecture_start, lecture_end, lecture_status)
       VALUES (?, ?, ?, ?, ?)`,
      [subject_id, lecture_date, lecture_start, lecture_end, lecture_status]
    );

    return this.findById(result.insertId);
  },

  /**
   * Update an existing lecture schedule
   * @param {number|string} id - Schedule ID
   * @param {Object} data - Update data payload
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    validateLectureSchedule(data, true);

    const subject_id = data.subject_id !== undefined ? data.subject_id : existing.subject_id;
    const lecture_date = data.lecture_date !== undefined ? data.lecture_date : existing.lecture_date;
    const lecture_start = data.lecture_start !== undefined ? data.lecture_start : existing.lecture_start;
    const lecture_end = data.lecture_end !== undefined ? data.lecture_end : existing.lecture_end;
    const lecture_status = data.lecture_status !== undefined ? data.lecture_status : existing.lecture_status;

    await pool.query(
      `UPDATE lecture_schedule
       SET subject_id = ?, lecture_date = ?, lecture_start = ?, lecture_end = ?, lecture_status = ?
       WHERE id = ?`,
      [subject_id, lecture_date, lecture_start, lecture_end, lecture_status, id]
    );

    return this.findById(id);
  },

  /**
   * Delete a lecture schedule by ID
   * @param {number|string} id - Schedule ID
   * @returns {Promise<boolean>} True if affected rows > 0
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM lecture_schedule WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
