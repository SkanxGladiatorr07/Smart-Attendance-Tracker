import pool from '../config/database.js';
import { SemesterCalendarModel } from './semesterCalendarModel.js';

/**
 * Stats Model - Handles database aggregation queries for attendance statistics.
 */
export const StatsModel = {
  /**
   * Fetch aggregated statistics per subject (excluding cancelled lectures)
   * @returns {Promise<Array<Object>>} Aggregated raw subject counts
   */
  async getSubjectStats() {
    try {
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
    } catch (err) {
      console.warn('StatsModel.getSubjectStats warning:', err.message);
      return [];
    }
  },

  /**
   * Fetch aggregated overall statistics across all subjects (excluding cancelled lectures)
   * @returns {Promise<Object>} Aggregated raw overall counts
   */
  async getOverallStats() {
    try {
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
      return (
        rows[0] || {
          total_lectures: 0,
          total_present: 0,
          total_absent: 0,
          total_pending: 0,
        }
      );
    } catch (err) {
      console.warn('StatsModel.getOverallStats warning:', err.message);
      return {
        total_lectures: 0,
        total_present: 0,
        total_absent: 0,
        total_pending: 0,
      };
    }
  },

  /**
   * Fetch combined live statistics (both subject and overall metrics) in parallel
   * @returns {Promise<{ rawSubjectStats: Array, rawOverallStats: Object }>}
   */
  async getLiveStats() {
    const [rawSubjectStats, rawOverallStats] = await Promise.all([
      this.getSubjectStats(),
      this.getOverallStats(),
    ]);
    return { rawSubjectStats, rawOverallStats };
  },

  /**
   * Fetch semester calendar progress calculations integrated with active semester config
   * @returns {Promise<Object>} Semester progress metrics
   */
  async getSemesterProgress() {
    try {
      const activeSemester = await SemesterCalendarModel.getActiveSemester();

      let startDateStr = activeSemester?.start_date;
      let endDateStr = activeSemester?.end_date;

      // Fallback to min and max dates from lecture_schedule if no active semester configured
      if (!startDateStr || !endDateStr) {
        const [dateBoundRows] = await pool.query(`
          SELECT 
            MIN(lecture_date) as min_date,
            MAX(lecture_date) as max_date
          FROM lecture_schedule
        `);
        startDateStr = dateBoundRows[0]?.min_date || new Date().toISOString().split('T')[0];
        endDateStr = dateBoundRows[0]?.max_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
      }

      // Fetch all calendar events in range
      const [events] = await pool.query(
        `SELECT event_type, start_date, end_date FROM calendar_events`
      );

      const todayStr = new Date().toISOString().split('T')[0];

      let totalWorkingDays = 0;
      let workingDaysCompleted = 0;
      let workingDaysRemaining = 0;

      const curr = new Date(startDateStr);
      const end = new Date(endDateStr);

      while (curr <= end) {
        const currIso = curr.toISOString().split('T')[0];
        const dayOfWeek = curr.getDay(); // 0 = Sun, 6 = Sat

        const isHoliday = events.some(e => e.event_type === 'holiday' && currIso >= e.start_date && currIso <= e.end_date);
        const isExam = events.some(e => e.event_type === 'exam_period' && currIso >= e.start_date && currIso <= e.end_date);
        const isWorkingSat = events.some(e => e.event_type === 'working_saturday' && currIso >= e.start_date && currIso <= e.end_date);

        let isWorking = true;
        if (isHoliday || isExam || dayOfWeek === 0) {
          isWorking = false;
        } else if (dayOfWeek === 6 && !isWorkingSat) {
          isWorking = false;
        }

        if (isWorking) {
          totalWorkingDays++;
          if (currIso <= todayStr) {
            workingDaysCompleted++;
          } else {
            workingDaysRemaining++;
          }
        }

        curr.setDate(curr.getDate() + 1);
      }

      // Query lecture counts
      const rawOverall = await this.getOverallStats();
      const totalLectures = Number(rawOverall.total_lectures) || 0;
      const totalPresent = Number(rawOverall.total_present) || 0;
      const totalAbsent = Number(rawOverall.total_absent) || 0;
      const totalMarked = totalPresent + totalAbsent;
      const totalPending = Number(rawOverall.total_pending) || Math.max(0, totalLectures - totalMarked);

      const semesterProgressPct = totalWorkingDays > 0
        ? Math.round((workingDaysCompleted / totalWorkingDays) * 100 * 100) / 100
        : 0;

      const overallAttendancePct = totalMarked > 0
        ? Math.round((totalPresent / totalMarked) * 100 * 100) / 100
        : 0;

      return {
        semesterName: activeSemester?.semester_name || 'Current Semester',
        startDate: startDateStr,
        endDate: endDateStr,
        todayDate: todayStr,
        semesterProgressPct: Math.min(100, Math.max(0, semesterProgressPct)),
        totalWorkingDays,
        workingDaysCompleted,
        workingDaysRemaining,
        totalLectures,
        totalLecturesCompleted: totalMarked,
        remainingLectures: totalPending,
        totalPresent,
        totalAbsent,
        overallAttendancePct,
      };
    } catch (err) {
      console.warn('StatsModel.getSemesterProgress warning:', err.message);
      return {
        semesterName: 'Current Semester',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        todayDate: new Date().toISOString().split('T')[0],
        semesterProgressPct: 0,
        totalWorkingDays: 0,
        workingDaysCompleted: 0,
        workingDaysRemaining: 0,
        totalLectures: 0,
        totalLecturesCompleted: 0,
        remainingLectures: 0,
        totalPresent: 0,
        totalAbsent: 0,
        overallAttendancePct: 0,
      };
    }
  },

  /**
   * Fetch complete analytics data aggregations for Chart.js dashboards
   * @returns {Promise<Object>} Analytics aggregations
   */
  async getAnalyticsData() {
    try {
      // 1. Monthly Trend Aggregation
      const sqlMonthly = `
        SELECT 
          DATE_FORMAT(ls.lecture_date, '%Y-%m') AS month_key,
          DATE_FORMAT(ls.lecture_date, '%b %Y') AS month_label,
          SUM(CASE WHEN ar.attendance_status = 'present' THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN ar.attendance_status = 'absent' THEN 1 ELSE 0 END) AS absent,
          COUNT(ar.id) AS total_marked
        FROM lecture_schedule ls
        JOIN attendance_records ar ON ls.id = ar.lecture_id
        WHERE ls.lecture_status != 'cancelled'
        GROUP BY month_key, month_label
        ORDER BY month_key ASC
      `;

      // 2. Daily Trend Aggregation
      const sqlDaily = `
        SELECT 
          DATE_FORMAT(ls.lecture_date, '%Y-%m-%d') AS date_key,
          DATE_FORMAT(ls.lecture_date, '%b %d') AS date_label,
          SUM(CASE WHEN ar.attendance_status = 'present' THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN ar.attendance_status = 'absent' THEN 1 ELSE 0 END) AS absent
        FROM lecture_schedule ls
        JOIN attendance_records ar ON ls.id = ar.lecture_id
        WHERE ls.lecture_status != 'cancelled'
        GROUP BY date_key, date_label
        ORDER BY date_key ASC
      `;

      const [monthlyRows] = await pool.query(sqlMonthly);
      const [dailyRows] = await pool.query(sqlDaily);

      // Process Monthly Trend percentages
      const monthlyTrend = (monthlyRows || []).map((row) => {
        const present = Number(row.present) || 0;
        const absent = Number(row.absent) || 0;
        const total = present + absent;
        const percentage = total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0;
        return {
          monthKey: row.month_key,
          label: row.month_label,
          present,
          absent,
          total,
          percentage,
        };
      });

      // Process Cumulative Progression
      let cumulativePresent = 0;
      let cumulativeMarked = 0;
      const progression = (dailyRows || []).map((row) => {
        const p = Number(row.present) || 0;
        const a = Number(row.absent) || 0;
        cumulativePresent += p;
        cumulativeMarked += p + a;
        const cumulativeRate = cumulativeMarked > 0
          ? Math.round((cumulativePresent / cumulativeMarked) * 100 * 10) / 10
          : 0;
        return {
          dateKey: row.date_key,
          label: row.date_label,
          dailyPresent: p,
          dailyAbsent: a,
          cumulativePresent,
          cumulativeMarked,
          cumulativeRate,
        };
      });

      return {
        monthlyTrend,
        dailyTrend: dailyRows || [],
        progression,
      };
    } catch (err) {
      console.warn('StatsModel.getAnalyticsData warning:', err.message);
      return {
        monthlyTrend: [],
        dailyTrend: [],
        progression: [],
      };
    }
  }
};
