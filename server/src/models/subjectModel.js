import pool from '../config/database.js';

/**
 * Subject Model - Handles all database operations for the `subjects` table.
 */
export const SubjectModel = {
  /**
   * Fetch all subjects sorted by creation date
   */
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY created_at DESC');
    return rows;
  },

  /**
   * Find a subject by ID
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * Create a new subject entry
   */
  async create({ subject_name, faculty_name, color = '#6366f1' }) {
    const [result] = await pool.query(
      'INSERT INTO subjects (subject_name, faculty_name, color) VALUES (?, ?, ?)',
      [subject_name, faculty_name, color]
    );
    return { id: result.insertId, subject_name, faculty_name, color };
  },

  /**
   * Delete a subject by ID
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
