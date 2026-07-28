import pool from '../config/database.js';

/**
 * Subject Model - Handles raw SQL queries for the `subjects` table.
 */
export const SubjectModel = {
  /**
   * Fetch all subjects ordered by creation date descending
   * @returns {Promise<Array<Object>>} Array of subject records
   */
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, subject_name, faculty_name, color, created_at FROM subjects ORDER BY created_at DESC'
    );
    return rows;
  },

  /**
   * Find a subject by ID
   * @param {number|string} id - Subject primary key
   * @returns {Promise<Object|null>} Subject record or null if not found
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, subject_name, faculty_name, color, created_at FROM subjects WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find a subject by subject_name (case-insensitive)
   * @param {string} subjectName - Name of subject
   * @returns {Promise<Object|null>} Subject record or null
   */
  async findByName(subjectName) {
    const [rows] = await pool.query(
      'SELECT id, subject_name, faculty_name, color, created_at FROM subjects WHERE LOWER(subject_name) = LOWER(?)',
      [subjectName]
    );
    return rows[0] || null;
  },

  /**
   * Find a subject by name excluding a specific ID (for update duplicate check)
   * @param {string} subjectName - Subject name
   * @param {number|string} id - Subject ID to exclude
   * @returns {Promise<Object|null>} Duplicate subject record or null
   */
  async findByNameExcludingId(subjectName, id) {
    const [rows] = await pool.query(
      'SELECT id, subject_name, faculty_name, color, created_at FROM subjects WHERE LOWER(subject_name) = LOWER(?) AND id != ?',
      [subjectName, id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new subject entry
   * @param {Object} data - Subject creation payload
   * @param {string} data.subject_name - Required subject title
   * @param {string} [data.faculty_name] - Optional faculty name
   * @param {string} [data.color] - Optional color hex code
   * @returns {Promise<Object>} Created subject record
   */
  async create({ subject_name, faculty_name = '', color = '#6366f1' }) {
    const [result] = await pool.query(
      'INSERT INTO subjects (subject_name, faculty_name, color) VALUES (?, ?, ?)',
      [subject_name, faculty_name, color]
    );
    return this.findById(result.insertId);
  },

  /**
   * Update an existing subject by ID
   * @param {number|string} id - Subject ID
   * @param {Object} data - Update data payload
   * @returns {Promise<Object|null>} Updated subject record
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
   * @param {number|string} id - Subject ID
   * @returns {Promise<boolean>} True if affected rows > 0
   */
  async deleteById(id) {
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
