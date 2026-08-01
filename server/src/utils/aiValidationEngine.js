import { isValidDate, isValidTime } from './dateUtils.js';

/**
 * AI Validation Layer Engine
 * Provides comprehensive validation, anomaly detection, and human-readable error reporting
 * for AI-generated JSON payloads (Timetables, Academic Calendars, and Complete Semester Schedules).
 */

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Helper to convert HH:MM to minutes since midnight for interval math
 */
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return -1;
  return parts[0] * 60 + parts[1];
}

/**
 * Validates a Weekly Timetable JSON payload from AI Vision model
 * @param {Object} timetableInput - Object with day keys ('Monday', 'Tuesday', etc.) mapping to lecture arrays
 * @returns {{ isValid: boolean, hasErrors: boolean, hasWarnings: boolean, summary: Object, issues: Array, sanitizedData: Object }}
 */
export function validateAiTimetable(timetableInput) {
  const issues = [];
  let totalItems = 0;
  const sanitizedTimetable = {};
  const detectedSubjects = new Set();

  if (!timetableInput || typeof timetableInput !== 'object') {
    return {
      isValid: false,
      hasErrors: true,
      hasWarnings: false,
      summary: { totalErrors: 1, totalWarnings: 0, itemsValidated: 0 },
      issues: [{
        id: 'err_root',
        field: 'timetable',
        message: 'Invalid AI response payload: Expected a JSON object.',
        severity: 'ERROR',
        context: {},
      }],
      sanitizedData: null,
    };
  }

  const rawTimetable = timetableInput.timetable || timetableInput;

  DAYS_OF_WEEK.forEach((day) => {
    // Case-insensitive key lookup
    const matchingKey = Object.keys(rawTimetable).find((k) => k.toLowerCase() === day.toLowerCase());
    const lectures = matchingKey && Array.isArray(rawTimetable[matchingKey]) ? rawTimetable[matchingKey] : [];

    sanitizedTimetable[day] = [];
    const timeIntervals = [];

    lectures.forEach((lec, idx) => {
      totalItems++;
      const itemContext = { day, index: idx, original: lec };

      // 1. Empty or Missing Subject Name Check
      const rawSubject = lec.subject || lec.name || lec.title;
      let subject = String(rawSubject || '').trim();

      if (!subject || subject.toLowerCase() === 'untitled' || subject.toLowerCase() === 'null') {
        issues.push({
          id: `err_empty_subj_${day}_${idx}`,
          field: 'subject',
          message: `Empty subject name detected in ${day} slot #${idx + 1}.`,
          severity: 'ERROR',
          context: itemContext,
        });
        subject = 'Unspecified Subject';
      } else {
        detectedSubjects.add(subject);
      }

      // 2. Missing or Invalid Lecture Timings Check
      const rawStart = lec.startTime || lec.start || lec.lecture_start;
      const rawEnd = lec.endTime || lec.end || lec.lecture_end;

      let startTime = String(rawStart || '').trim();
      let endTime = String(rawEnd || '').trim();

      if (!startTime || !isValidTime(startTime)) {
        issues.push({
          id: `err_invalid_start_${day}_${idx}`,
          field: 'startTime',
          message: `Invalid or missing start time "${rawStart}" for ${subject} on ${day}. Expected HH:MM format.`,
          severity: 'ERROR',
          context: itemContext,
        });
      }

      if (!endTime || !isValidTime(endTime)) {
        issues.push({
          id: `err_invalid_end_${day}_${idx}`,
          field: 'endTime',
          message: `Invalid or missing end time "${rawEnd}" for ${subject} on ${day}. Expected HH:MM format.`,
          severity: 'ERROR',
          context: itemContext,
        });
      }

      // 3. Time Range Logic & Duration Checks
      if (isValidTime(startTime) && isValidTime(end_time_fix(endTime))) {
        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(end_time_fix(endTime));

        if (startMin >= endMin) {
          issues.push({
            id: `err_time_range_${day}_${idx}`,
            field: 'timeRange',
            message: `Invalid time range for ${subject} on ${day}: Start time (${startTime}) must be earlier than end time (${endTime}).`,
            severity: 'ERROR',
            context: itemContext,
          });
        } else {
          const duration = endMin - startMin;
          if (duration < 15) {
            issues.push({
              id: `warn_short_lecture_${day}_${idx}`,
              field: 'duration',
              message: `Unusually short lecture duration (${duration} mins) for ${subject} on ${day}.`,
              severity: 'WARNING',
              context: itemContext,
            });
          } else if (duration > 300) {
            issues.push({
              id: `warn_long_lecture_${day}_${idx}`,
              field: 'duration',
              message: `Unusually long lecture duration (${Math.round(duration / 60)} hours) for ${subject} on ${day}.`,
              severity: 'WARNING',
              context: itemContext,
            });
          }

          // 4. Check Overlapping Lectures on Same Day
          timeIntervals.forEach((prev) => {
            if (startMin < prev.endMin && endMin > prev.startMin) {
              issues.push({
                id: `err_overlap_${day}_${idx}_${prev.idx}`,
                field: 'overlap',
                message: `Overlapping lecture slots on ${day}: "${subject}" (${startTime}-${endTime}) overlaps with "${prev.subject}" (${prev.startTime}-${prev.endTime}).`,
                severity: 'ERROR',
                context: { day, idx1: prev.idx, idx2: idx, subject1: prev.subject, subject2: subject },
              });
            }
          });

          timeIntervals.push({ startMin, endMin, startTime, endTime, subject, idx });
        }
      }

      sanitizedTimetable[day].push({
        subject,
        startTime,
        endTime: end_time_fix(endTime),
        type: String(lec.type || lec.lectureType || 'Lecture').trim(),
        room: String(lec.room || lec.room_number || '').trim(),
      });
    });
  });

  const totalErrors = issues.filter((i) => i.severity === 'ERROR').length;
  const totalWarnings = issues.filter((i) => i.severity === 'WARNING').length;

  return {
    isValid: totalErrors === 0,
    hasErrors: totalErrors > 0,
    hasWarnings: totalWarnings > 0,
    summary: {
      totalErrors,
      totalWarnings,
      itemsValidated: totalItems,
      detectedSubjectsCount: detectedSubjects.size,
    },
    issues,
    sanitizedData: {
      timetable: sanitizedTimetable,
      metadata: {
        totalLectures: totalItems,
        detectedSubjects: Array.from(detectedSubjects),
      },
    },
  };
}

function end_time_fix(t) {
  return t;
}

/**
 * Validates Academic Calendar JSON payload
 * @param {Object} calendarInput - Object with semesterStart, semesterEnd, holidays, workingSaturdays, examPeriods
 * @returns {{ isValid: boolean, hasErrors: boolean, hasWarnings: boolean, summary: Object, issues: Array, sanitizedData: Object }}
 */
export function validateAiAcademicCalendar(calendarInput) {
  const issues = [];
  if (!calendarInput || typeof calendarInput !== 'object') {
    return {
      isValid: false,
      hasErrors: true,
      hasWarnings: false,
      summary: { totalErrors: 1, totalWarnings: 0 },
      issues: [{ id: 'err_cal_root', field: 'calendar', message: 'Invalid Academic Calendar object.', severity: 'ERROR' }],
      sanitizedData: null,
    };
  }

  const { semesterStart, semesterEnd, holidays = [], workingSaturdays = [], examPeriods = [] } = calendarInput;

  // 1. Missing Fields Check
  if (!semesterStart) {
    issues.push({ id: 'err_sem_start_missing', field: 'semesterStart', message: 'Missing semesterStart date.', severity: 'ERROR' });
  } else if (!isValidDate(semesterStart)) {
    issues.push({ id: 'err_sem_start_invalid', field: 'semesterStart', message: `Invalid semesterStart date format "${semesterStart}". Expected YYYY-MM-DD.`, severity: 'ERROR' });
  }

  if (!semesterEnd) {
    issues.push({ id: 'err_sem_end_missing', field: 'semesterEnd', message: 'Missing semesterEnd date.', severity: 'ERROR' });
  } else if (!isValidDate(semesterEnd)) {
    issues.push({ id: 'err_sem_end_invalid', field: 'semesterEnd', message: `Invalid semesterEnd date format "${semesterEnd}". Expected YYYY-MM-DD.`, severity: 'ERROR' });
  }

  // 2. Invalid Semester Range Check
  if (isValidDate(semesterStart) && isValidDate(semesterEnd)) {
    const dStart = new Date(semesterStart);
    const dEnd = new Date(semesterEnd);

    if (dStart >= dEnd) {
      issues.push({
        id: 'err_sem_range',
        field: 'semesterRange',
        message: `Invalid semester range: semesterStart (${semesterStart}) must be strictly earlier than semesterEnd (${semesterEnd}).`,
        severity: 'ERROR',
      });
    } else {
      const daysDiff = Math.round((dEnd - dStart) / (1000 * 60 * 60 * 24));
      if (daysDiff < 30) {
        issues.push({
          id: 'warn_sem_short',
          field: 'semesterDuration',
          message: `Semester duration is unusually short (${daysDiff} days).`,
          severity: 'WARNING',
        });
      } else if (daysDiff > 365) {
        issues.push({
          id: 'warn_sem_long',
          field: 'semesterDuration',
          message: `Semester duration is longer than a year (${daysDiff} days).`,
          severity: 'WARNING',
        });
      }
    }
  }

  // 3. Duplicate Holidays & Invalid Dates Check
  const holidayDateMap = new Map();
  const sanitizedHolidays = [];

  (holidays || []).forEach((h, idx) => {
    const hName = String(h.name || h.title || h.event_name || 'Holiday').trim();
    const hDate = String(h.date || h.start_date || h.startDate || '').trim();

    if (!hDate || !isValidDate(hDate)) {
      issues.push({
        id: `err_holiday_date_${idx}`,
        field: 'holidays',
        message: `Invalid date "${hDate}" for holiday "${hName}". Expected YYYY-MM-DD format.`,
        severity: 'ERROR',
        context: { index: idx, holiday: h },
      });
    } else {
      // Check duplicate holiday date or name
      if (holidayDateMap.has(hDate)) {
        const prev = holidayDateMap.get(hDate);
        issues.push({
          id: `warn_holiday_dup_${idx}`,
          field: 'holidays',
          message: `Duplicate holiday detected on ${hDate}: "${hName}" conflicts with "${prev}".`,
          severity: 'WARNING',
          context: { index: idx, date: hDate, name1: prev, name2: hName },
        });
      } else {
        holidayDateMap.set(hDate, hName);
      }
    }

    sanitizedHolidays.push({ name: hName, date: hDate });
  });

  const totalErrors = issues.filter((i) => i.severity === 'ERROR').length;
  const totalWarnings = issues.filter((i) => i.severity === 'WARNING').length;

  return {
    isValid: totalErrors === 0,
    hasErrors: totalErrors > 0,
    hasWarnings: totalWarnings > 0,
    summary: { totalErrors, totalWarnings },
    issues,
    sanitizedData: {
      semesterStart,
      semesterEnd,
      holidays: sanitizedHolidays,
      workingSaturdays,
      examPeriods,
    },
  };
}
