import pool from '../config/database.js';
import { SemesterCalendarModel } from '../models/semesterCalendarModel.js';

/**
 * Daily Schedule Engine Service - Determines working day status, holiday reasons,
 * and fetches chronologically grouped lecture schedules for any given date.
 */
export const DailyScheduleService = {
  /**
   * Get formatted local ISO date string (YYYY-MM-DD)
   * @param {Date} [date] 
   * @returns {string}
   */
  getLocalDateIso(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Fetch today's or target date's schedule with working day & calendar status
   * @param {string} [targetDateStr] YYYY-MM-DD (Defaults to today)
   * @returns {Promise<Object>} Complete daily schedule engine response payload
   */
  async getDailySchedule(targetDateStr = null) {
    const dateStr = targetDateStr || this.getLocalDateIso();
    
    // Parse target Date object for day of week evaluation
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let activeSemester = null;
    let calendarEvents = [];
    let rows = [];

    try {
      // 1. Check Active Semester Configuration
      activeSemester = await SemesterCalendarModel.getActiveSemester();

      // 2. Check Calendar Events matching the target date
      calendarEvents = await SemesterCalendarModel.getEventsForDate(dateStr);

      // 4. Fetch Scheduled Lectures from MySQL Database (Optimized JOIN)
      const sql = `
        SELECT
          ls.id AS lecture_id,
          ls.subject_id,
          DATE_FORMAT(ls.lecture_date, "%Y-%m-%d") AS lecture_date,
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
        WHERE ls.lecture_date = ?
        ORDER BY ls.lecture_start ASC
      `;

      const [queryRows] = await pool.query(sql, [dateStr]);
      rows = queryRows || [];
    } catch (dbErr) {
      console.warn('DailyScheduleService database query warning:', dbErr.message);
    }

    // 3. Evaluate Working Day Status & Holiday Reason
    let isWorkingDay = true;
    let holidayReason = null;
    let eventDetail = null;

    const holidayEvent = calendarEvents.find(e => e.event_type === 'holiday');
    const examEvent = calendarEvents.find(e => e.event_type === 'exam_period');
    const workingSatEvent = calendarEvents.find(e => e.event_type === 'working_saturday');

    if (holidayEvent) {
      isWorkingDay = false;
      holidayReason = `Holiday: ${holidayEvent.event_name}`;
      eventDetail = holidayEvent;
    } else if (examEvent) {
      isWorkingDay = false;
      holidayReason = `Exam Period: ${examEvent.event_name}`;
      eventDetail = examEvent;
    } else if (dayOfWeek === 'Sunday') {
      isWorkingDay = false;
      holidayReason = 'Sunday (Weekend)';
    } else if (dayOfWeek === 'Saturday') {
      if (workingSatEvent) {
        isWorkingDay = true;
        holidayReason = `Working Saturday: ${workingSatEvent.event_name}`;
        eventDetail = workingSatEvent;
      } else {
        isWorkingDay = false;
        holidayReason = 'Weekend (Non-working Saturday)';
      }
    } else if (activeSemester) {
      if (dateStr < activeSemester.start_date || dateStr > activeSemester.end_date) {
        isWorkingDay = false;
        holidayReason = `Outside Active Semester (${activeSemester.start_date} to ${activeSemester.end_date})`;
      }
    }

    // Format & normalize lecture items
    const lectures = rows.map(r => ({
      ...r,
      startTimeFormatted: this.formatTime12Hour(r.lecture_start),
      endTimeFormatted: this.formatTime12Hour(r.lecture_end),
      durationMinutes: this.calculateDuration(r.lecture_start, r.lecture_end)
    }));

    // 5. Group Lectures Chronologically
    const groupedLectures = {
      Morning: [],
      Afternoon: [],
      Evening: []
    };

    lectures.forEach(lec => {
      const startHour = parseInt(lec.lecture_start.split(':')[0], 10);
      if (startHour < 12) {
        groupedLectures.Morning.push(lec);
      } else if (startHour < 16) {
        groupedLectures.Afternoon.push(lec);
      } else {
        groupedLectures.Evening.push(lec);
      }
    });

    // Calculate Summary Statistics
    const summary = {
      total: lectures.length,
      present: lectures.filter(l => l.attendance_status === 'present').length,
      absent: lectures.filter(l => l.attendance_status === 'absent').length,
      pending: lectures.filter(l => l.attendance_status === 'pending').length
    };

    let message = 'Scheduled lectures for today.';
    if (!isWorkingDay) {
      message = holidayReason || 'No lectures today.';
    } else if (lectures.length === 0) {
      message = 'No lectures scheduled for today.';
    }

    return {
      date: dateStr,
      formattedDate,
      dayOfWeek,
      isWorkingDay,
      reason: holidayReason,
      message,
      eventDetail,
      activeSemester: activeSemester ? {
        startDate: activeSemester.start_date,
        endDate: activeSemester.end_date,
        name: activeSemester.semester_name
      } : null,
      summary,
      lectures,
      groupedLectures
    };
  },

  /**
   * Helper to format '14:30:00' to '2:30 PM'
   */
  formatTime12Hour(timeStr) {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = mStr || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  },

  /**
   * Calculate duration in minutes between start and end time
   */
  calculateDuration(startStr, endStr) {
    if (!startStr || !endStr) return 0;
    const [h1, m1] = startStr.split(':').map(Number);
    const [h2, m2] = endStr.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }
};
