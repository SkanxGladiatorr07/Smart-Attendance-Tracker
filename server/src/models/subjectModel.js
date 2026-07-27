import pool from '../config/database.js';

/**
 * Subject Model - Handles raw database SQL queries for the `subjects` table.
 */
export const SubjectModel = {
  /**
   * Fetch all subjects ordered by creation date
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
   * Find a subject by subject_name (case-insensitive)
   */
  async findByName(subjectName) {
    const [rows] = await pool.query(
      'SELECT * FROM subjects WHERE LOWER(subject_name) = LOWER(?)',
      [subjectName]
    );
    return rows[0] || null;
  },

  /**
   * Find a subject by name excluding a specific ID (for update duplicate check)
   */
  async findByNameExcludingId(subjectName, id) {
    const [rows] = await pool.query(
      'SELECT * FROM subjects WHERE LOWER(subject_name) = LOWER(?) AND id != ?',
      [subjectName, id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new subject entry
   */
  async create({ subject_name, faculty_name = '', color = '#6366f1' }) {
    const [result] = await pool.query(
      'INSERT INTO subjects (subject_name, faculty_name, color) VALUES (?, ?, ?)',
      [subject_name, faculty_name, color]
    );
    return this.findById(result.insertId);
  },

  /**
   * Update an existing subject
   */
  async update(id, { subject_name, faculty_name, color }) {
    await pool.query(
      'UPDATE subjects SET subject_name = ?, faculty_name = ?, color = ? WHERE id = ?',
      [subject_name, faculty_name, color, id]
    );
    return this.findById(id);
  },

  /**
   * Delete a subject by ID
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
