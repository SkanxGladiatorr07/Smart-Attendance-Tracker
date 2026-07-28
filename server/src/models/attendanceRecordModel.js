import pool from '../config/database.js';
import { validateAttendanceRecord } from '../utils/validators.js';

/**
 * AttendanceRecord Model - Handles SQL database queries for the `attendance_records` table.
 */
export const AttendanceRecordModel = {
  /**
   * Fetch all attendance records with optional filtering
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.attendance_status] - Status ('present'|'absent'|'pending')
   * @param {number|string} [filters.subject_id] - Subject ID
   * @param {number|string} [filters.lecture_id] - Lecture schedule ID
   * @param {string} [filters.lecture_date] - Date YYYY-MM-DD
   * @param {string} [filters.start_date] - Date range start
   * @param {string} [filters.end_date] - Date range end
   * @returns {Promise<Array<Object>>} Joined attendance records
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT 
        ar.id, ar.lecture_id, ar.attendance_status, ar.updated_at,
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

    if (filters.lecture_date) {
      conditions.push('ls.lecture_date = ?');
      params.push(filters.lecture_date);
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
   * Fetch today's lectures with attendance records (defaults status to 'pending' if unmarked)
   * @returns {Promise<Array<Object>>} Today's lectures list
   */
  async findTodayAttendance() {
    const sql = `
      SELECT
        ls.id AS lecture_id,
        ls.subject_id,
        ls.lecture_date,
        ls.lecture_start,
        ls.lecture_end,
        ls.lecture_status,
        s.subject_name,
        s.faculty_name,
        s.color,
        ar.id AS id,
        COALESCE(ar.attendance_status, 'pending') AS attendance_status,
        ar.updated_at
      FROM lecture_schedule ls
      JOIN subjects s ON ls.subject_id = s.id
      LEFT JOIN attendance_records ar ON ar.lecture_id = ls.id
      WHERE ls.lecture_date = CURRENT_DATE()
      ORDER BY ls.lecture_start ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Find an attendance record by ID
   * @param {number|string} id - Attendance record primary key
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findById(id) {
    const sql = `
      SELECT 
        ar.id, ar.lecture_id, ar.attendance_status, ar.updated_at,
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
   * @param {number|string} lectureId - Lecture schedule ID
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findByLectureId(lectureId) {
    const sql = `
      SELECT 
        ar.id, ar.lecture_id, ar.attendance_status, ar.updated_at,
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
   * @param {Object} data - Attendance record payload
   * @param {number} data.lecture_id - Lecture ID
   * @param {string} [data.attendance_status='pending'] - Status
   * @returns {Promise<Object>} Created attendance record
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
   * Update attendance record status by record ID
   * @param {number|string} id - Attendance record ID
   * @param {Object} data - Update data
   * @param {string} data.attendance_status - New status
   * @returns {Promise<Object|null>} Updated attendance record
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
   * @param {number|string} lectureId - Lecture ID
   * @param {string} attendanceStatus - Status
   * @returns {Promise<Object>} Attendance record
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
   * Delete attendance record by record ID
   * @param {number|string} id - Attendance record ID
   * @returns {Promise<boolean>} True if affected rows > 0
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM attendance_records WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Delete attendance record by lecture ID
   * @param {number|string} lectureId - Lecture ID
   * @returns {Promise<boolean>} True if affected rows > 0
   */
  async deleteByLectureId(lectureId) {
    const [result] = await pool.query('DELETE FROM attendance_records WHERE lecture_id = ?', [lectureId]);
    return result.affectedRows > 0;
  },
};
