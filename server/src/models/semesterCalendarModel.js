import pool from '../config/database.js';

/**
 * SemesterCalendar Model - Handles database operations for `semester_config` and `calendar_events` tables.
 */
export const SemesterCalendarModel = {
  /**
   * Auto-ensure schema tables exist in MySQL
   */
  async ensureTablesExist() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS semester_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          semester_name VARCHAR(100) NOT NULL DEFAULT 'Current Semester',
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          semester_id INT NOT NULL DEFAULT 1,
          event_type ENUM('holiday', 'working_saturday', 'exam_period') NOT NULL,
          event_name VARCHAR(150) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_calendar_events_type (event_type),
          INDEX idx_calendar_events_dates (start_date, end_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('SemesterCalendarModel.ensureTablesExist warning:', err.message);
    }
  },

  /**
   * Saves or replaces semester configuration & calendar events in MySQL
   * @param {Object} calendarData 
   * @param {string} calendarData.semesterStart YYYY-MM-DD
   * @param {string} calendarData.semesterEnd YYYY-MM-DD
   * @param {Array} [calendarData.holidays]
   * @param {Array} [calendarData.workingSaturdays]
   * @param {Array} [calendarData.examPeriods]
   * @param {Object} [connection] Optional transactional connection
   */
  async saveSemesterCalendar({ semesterStart, semesterEnd, holidays = [], workingSaturdays = [], examPeriods = [] }, connection = null) {
    await this.ensureTablesExist();

    const conn = connection || await pool.getConnection();
    const isLocalConn = !connection;

    try {
      if (isLocalConn) await conn.beginTransaction();

      // Deactivate prior semester configs
      await conn.query('UPDATE semester_config SET is_active = FALSE');

      // Insert new active semester config
      const [resConfig] = await conn.query(
        'INSERT INTO semester_config (semester_name, start_date, end_date, is_active) VALUES (?, ?, ?, TRUE)',
        ['Current Semester', semesterStart, semesterEnd]
      );

      const semesterId = resConfig.insertId;

      // Clear existing calendar events for this semester
      await conn.query('DELETE FROM calendar_events WHERE semester_id = ?', [semesterId]);

      const eventsToInsert = [];

      // Process Holidays
      (holidays || []).forEach((h) => {
        const date = h.date || h.startDate;
        const name = h.name || h.title || h.description || 'Holiday';
        if (date) {
          eventsToInsert.push([semesterId, 'holiday', name, date, date, h.description || null]);
        }
      });

      // Process Working Saturdays
      (workingSaturdays || []).forEach((ws) => {
        const date = ws.date;
        const desc = ws.description || ws.name || 'Working Saturday';
        if (date) {
          eventsToInsert.push([semesterId, 'working_saturday', desc, date, date, desc]);
        }
      });

      // Process Exam Periods
      (examPeriods || []).forEach((ex) => {
        const sDate = ex.startDate || ex.date;
        const eDate = ex.endDate || sDate;
        const title = ex.title || ex.name || 'Examination Period';
        if (sDate && eDate) {
          eventsToInsert.push([semesterId, 'exam_period', title, sDate, eDate, ex.description || null]);
        }
      });

      if (eventsToInsert.length > 0) {
        await conn.query(
          `INSERT INTO calendar_events (semester_id, event_type, event_name, start_date, end_date, description) VALUES ?`,
          [eventsToInsert]
        );
      }

      if (isLocalConn) await conn.commit();

      return { semesterId, eventCount: eventsToInsert.length };
    } catch (err) {
      if (isLocalConn) await conn.rollback();
      throw err;
    } finally {
      if (isLocalConn) conn.release();
    }
  },

  /**
   * Get currently active semester configuration
   * @returns {Promise<Object|null>}
   */
  async getActiveSemester() {
    await this.ensureTablesExist();
    try {
      const [rows] = await pool.query(
        'SELECT id, semester_name, DATE_FORMAT(start_date, "%Y-%m-%d") as start_date, DATE_FORMAT(end_date, "%Y-%m-%d") as end_date FROM semester_config WHERE is_active = TRUE ORDER BY id DESC LIMIT 1'
      );
      return rows[0] || null;
    } catch (err) {
      console.warn('SemesterCalendarModel.getActiveSemester warning:', err.message);
      return null;
    }
  },

  /**
   * Check events occurring on or containing a specific date
   * @param {string} dateStr YYYY-MM-DD
   * @returns {Promise<Array<Object>>}
   */
  async getEventsForDate(dateStr) {
    await this.ensureTablesExist();
    try {
      const [rows] = await pool.query(
        `SELECT id, event_type, event_name, DATE_FORMAT(start_date, "%Y-%m-%d") as start_date, DATE_FORMAT(end_date, "%Y-%m-%d") as end_date, description
         FROM calendar_events
         WHERE ? BETWEEN start_date AND end_date`,
        [dateStr]
      );
      return rows;
    } catch (err) {
      console.warn('SemesterCalendarModel.getEventsForDate warning:', err.message);
      return [];
    }
  },

  /**
   * Fetch calendar events overlapping a date range [startDateStr, endDateStr]
   * @param {string} startDateStr YYYY-MM-DD
   * @param {string} endDateStr YYYY-MM-DD
   * @returns {Promise<Array<Object>>}
   */
  async getEventsForRange(startDateStr, endDateStr) {
    await this.ensureTablesExist();
    try {
      const [rows] = await pool.query(
        `SELECT id, event_type, event_name, DATE_FORMAT(start_date, "%Y-%m-%d") as start_date, DATE_FORMAT(end_date, "%Y-%m-%d") as end_date, description
         FROM calendar_events
         WHERE start_date <= ? AND end_date >= ?`,
        [endDateStr, startDateStr]
      );
      return rows;
    } catch (err) {
      console.warn('SemesterCalendarModel.getEventsForRange warning:', err.message);
      return [];
    }
  }
};
