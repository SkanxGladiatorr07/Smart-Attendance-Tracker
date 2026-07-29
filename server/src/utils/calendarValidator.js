/**
 * Helper to check if a string is a valid ISO date string (YYYY-MM-DD)
 */
const isValidIsoDate = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Normalizes date string to YYYY-MM-DD format if possible
 */
const normalizeDate = (dateStr, fallback = null) => {
  if (!dateStr) return fallback;
  if (isValidIsoDate(dateStr)) return dateStr;

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return fallback;
};

/**
 * Validates and normalizes structured calendar JSON output from AI Vision Model
 * @param {Object} rawData - Unsanitized output parsed from AI Vision response
 * @returns {{ isValid: boolean, data: Object, errors: string[] }}
 */
export const validateCalendarJson = (rawData) => {
  const errors = [];
  if (!rawData || typeof rawData !== 'object') {
    return {
      isValid: false,
      data: null,
      errors: ['Invalid AI response format: Expected a valid JSON object.']
    };
  }

  // 1. Validate Semester Dates
  const semesterStart = normalizeDate(rawData.semesterStart, '2026-07-15');
  const semesterEnd = normalizeDate(rawData.semesterEnd, '2026-11-30');

  if (!rawData.semesterStart) {
    errors.push('Missing "semesterStart" field in calendar data.');
  }
  if (!rawData.semesterEnd) {
    errors.push('Missing "semesterEnd" field in calendar data.');
  }

  // 2. Validate Holidays Array
  const holidays = Array.isArray(rawData.holidays)
    ? rawData.holidays
        .filter((item) => item && (item.date || item.name))
        .map((item) => ({
          date: normalizeDate(item.date, new Date().toISOString().split('T')[0]),
          name: String(item.name || 'Official Holiday').trim()
        }))
    : [];

  // 3. Validate Working Saturdays Array
  const workingSaturdays = Array.isArray(rawData.workingSaturdays)
    ? rawData.workingSaturdays
        .filter((item) => item && (item.date || item.description))
        .map((item) => ({
          date: normalizeDate(item.date, new Date().toISOString().split('T')[0]),
          description: String(item.description || 'Working Saturday (Follows weekday timetable)').trim()
        }))
    : [];

  // 4. Validate Exam Periods Array
  const examPeriods = Array.isArray(rawData.examPeriods)
    ? rawData.examPeriods
        .filter((item) => item && item.title)
        .map((item) => ({
          title: String(item.title).trim(),
          startDate: normalizeDate(item.startDate, semesterStart),
          endDate: normalizeDate(item.endDate, semesterEnd)
        }))
    : [];

  // 5. Validate Notes Array
  const notes = Array.isArray(rawData.notes)
    ? rawData.notes.map((note) => String(note).trim()).filter(Boolean)
    : [];

  const sanitizedData = {
    semesterStart,
    semesterEnd,
    holidays,
    workingSaturdays,
    examPeriods,
    notes
  };

  return {
    isValid: errors.length === 0,
    data: sanitizedData,
    errors
  };
};
