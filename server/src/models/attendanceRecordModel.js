import pool from '../config/database.js';
import { validateAttendanceRecord } from '../utils/validators.js';

/**
 * AttendanceRecord Model - Handles SQL queries for the `attendance_records` table.
 */
export const AttendanceRecordModel = {
  /**
   * Fetch all attendance records, with optional filtering
   * @param {Object} filters - Optional filters (attendance_status, subject_id, lecture_id, start_date, end_date)
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT ar.*,
             ls.subject_id, ls.lecture_date, ls.lecture_start, ls.lecture_end, ls.lecture_status,
             s.subject_name, s.faculty_name, s.color
      FROM attendance_records ar
      JOIN lecture_schedule ls ON ar.lecture_id = ls.id
      JOIN subjects s ON ls.subject_id = s.id
    `;
    const conditions = [];
    const params = [];

    if (filters.attendance_status) {
      conditions.push('ar.attendance_status = ?');
      params.push(filters.attendance_status);
    }

    if (filters.subject_id) {
      conditions.push('ls.subject_id = ?');
      params.push(filters.subject_id);
    }

    if (filters.lecture_id) {
      conditions.push('ar.lecture_id = ?');
      params.push(filters.lecture_id);
    }

    if (filters.start_date && filters.end_date) {
      conditions.push('ls.lecture_date BETWEEN ? AND ?');
      params.push(filters.start_date, filters.end_date);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY ls.lecture_date DESC, ls.lecture_start ASC';

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /**
   * Find an attendance record by ID
   */
  async findById(id) {
    const sql = `
      SELECT ar.*,
             ls.subject_id, ls.lecture_date, ls.lecture_start, ls.lecture_end, ls.lecture_status,
             s.subject_name, s.faculty_name, s.color
      FROM attendance_records ar
      JOIN lecture_schedule ls ON ar.lecture_id = ls.id
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ar.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Find an attendance record by lecture ID
   */
  async findByLectureId(lectureId) {
    const sql = `
      SELECT ar.*,
             ls.subject_id, ls.lecture_date, ls.lecture_start, ls.lecture_end, ls.lecture_status,
             s.subject_name, s.faculty_name, s.color
      FROM attendance_records ar
      JOIN lecture_schedule ls ON ar.lecture_id = ls.id
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ar.lecture_id = ?
    `;
    const [rows] = await pool.query(sql, [lectureId]);
    return rows[0] || null;
  },

  /**
   * Create a new attendance record entry
   */
  async create({ lecture_id, attendance_status = 'pending' }) {
    validateAttendanceRecord({ lecture_id, attendance_status });

    const [result] = await pool.query(
      `INSERT INTO attendance_records (lecture_id, attendance_status)
       VALUES (?, ?)`,
      [lecture_id, attendance_status]
    );

    return this.findById(result.insertId);
  },

  /**
   * Update attendance record status by ID
   */
  async update(id, { attendance_status }) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    validateAttendanceRecord({ attendance_status }, true);

    await pool.query(
      `UPDATE attendance_records
       SET attendance_status = ?
       WHERE id = ?`,
      [attendance_status, id]
    );

    return this.findById(id);
  },

  /**
   * Upsert attendance status for a lecture ID (create if absent, update if exists)
   */
  async upsertByLectureId(lectureId, attendanceStatus) {
    validateAttendanceRecord({ lecture_id: lectureId, attendance_status: attendanceStatus });

    await pool.query(
      `INSERT INTO attendance_records (lecture_id, attendance_status)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE attendance_status = VALUES(attendance_status)`,
      [lectureId, attendanceStatus]
    );

    return this.findByLectureId(lectureId);
  },

  /**
   * Delete attendance record by ID
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM attendance_records WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Delete attendance record by lecture ID
   */
  async deleteByLectureId(lectureId) {
    const [result] = await pool.query('DELETE FROM attendance_records WHERE lecture_id = ?', [lectureId]);
    return result.affectedRows > 0;
  },
};
