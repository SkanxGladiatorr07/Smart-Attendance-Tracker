import pool from '../config/database.js';
import { validateLectureSchedule } from '../utils/validators.js';

/**
 * LectureSchedule Model - Handles SQL queries for the `lecture_schedule` table.
 */
export const LectureScheduleModel = {
  /**
   * Fetch all lecture schedules, with optional filtering
   * @param {Object} filters - Optional filters (subject_id, lecture_date, start_date, end_date, lecture_status)
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT ls.*, s.subject_name, s.faculty_name, s.color
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
   */
  async findById(id) {
    const sql = `
      SELECT ls.*, s.subject_name, s.faculty_name, s.color
      FROM lecture_schedule ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ls.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Find all lecture schedules by subject ID
   */
  async findBySubjectId(subjectId) {
    return this.findAll({ subject_id: subjectId });
  },

  /**
   * Create a new lecture schedule entry
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
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM lecture_schedule WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
