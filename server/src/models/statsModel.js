import pool from '../config/database.js';

/**
 * Stats Model - Handles database aggregation queries for attendance statistics
 */
export const StatsModel = {
  /**
   * Fetch aggregated statistics per subject
   */
  async getSubjectStats() {
    const sql = `
      SELECT 
        s.id AS subject_id,
        s.subject_name,
        s.faculty_name,
        s.color,
        COUNT(ls.id) AS total_lectures,
        SUM(CASE WHEN ar.attendance_status = 'present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN ar.attendance_status = 'absent' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN ar.attendance_status IS NULL OR ar.attendance_status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM subjects s
      LEFT JOIN lecture_schedule ls ON s.id = ls.subject_id AND ls.lecture_status != 'cancelled'
      LEFT JOIN attendance_records ar ON ls.id = ar.lecture_id
      GROUP BY s.id, s.subject_name, s.faculty_name, s.color
      ORDER BY s.subject_name ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Fetch aggregated overall statistics across all subjects
   */
  async getOverallStats() {
    const sql = `
      SELECT 
        COUNT(ls.id) AS total_lectures,
        SUM(CASE WHEN ar.attendance_status = 'present' THEN 1 ELSE 0 END) AS total_present,
        SUM(CASE WHEN ar.attendance_status = 'absent' THEN 1 ELSE 0 END) AS total_absent,
        SUM(CASE WHEN ar.attendance_status IS NULL OR ar.attendance_status = 'pending' THEN 1 ELSE 0 END) AS total_pending
      FROM lecture_schedule ls
      LEFT JOIN attendance_records ar ON ls.id = ar.lecture_id
      WHERE ls.lecture_status != 'cancelled'
    `;
    const [rows] = await pool.query(sql);
    return rows[0] || {
      total_lectures: 0,
      total_present: 0,
      total_absent: 0,
      total_pending: 0,
    };
  },
};
