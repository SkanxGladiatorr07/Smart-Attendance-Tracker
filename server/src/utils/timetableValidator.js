const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Normalizes time string to HH:MM format (24-hour)
 */
const normalizeTimeStr = (timeStr, defaultTime = '09:00') => {
  if (!timeStr || typeof timeStr !== 'string') return defaultTime;
  const cleaned = timeStr.trim();

  // Match 12-hour format with AM/PM (e.g., "09:30 AM", "2:15 PM")
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // Match 24-hour format (e.g., "09:00", "14:30")
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return cleaned;
};

/**
 * Validates and normalizes structured timetable JSON from AI Vision model
 * @param {Object} rawData - Unsanitized output parsed from AI Vision model
 * @returns {{ isValid: boolean, data: Object, errors: string[] }}
 */
export const validateTimetableJson = (rawData) => {
  const errors = [];
  if (!rawData || typeof rawData !== 'object') {
    return {
      isValid: false,
      data: null,
      errors: ['Invalid AI response format: Expected a valid JSON object.']
    };
  }

  const timetableInput = rawData.timetable || rawData;
  const sanitizedTimetable = {};
  const detectedSubjectsSet = new Set();
  let totalLectures = 0;

  DAYS_OF_WEEK.forEach((day) => {
    // Case-insensitive day key lookup
    const matchingKey = Object.keys(timetableInput).find(
      (k) => k.toLowerCase() === day.toLowerCase()
    );

    const lecturesList = matchingKey && Array.isArray(timetableInput[matchingKey])
      ? timetableInput[matchingKey]
      : [];

    sanitizedTimetable[day] = lecturesList
      .filter((lec) => lec && (lec.subject || lec.name || lec.title))
      .map((lec) => {
        const subject = String(lec.subject || lec.name || lec.title || 'General Class').trim();
        const startTime = normalizeTimeStr(lec.startTime || lec.start, '09:00');
        const endTime = normalizeTimeStr(lec.endTime || lec.end, '10:00');
        const type = String(lec.type || lec.lectureType || 'Lecture').trim();

        detectedSubjectsSet.add(subject);
        totalLectures += 1;

        return {
          subject,
          startTime,
          endTime,
          type
        };
      });
  });

  const metadata = {
    totalLectures,
    detectedSubjects: Array.from(detectedSubjectsSet)
  };

  if (totalLectures === 0) {
    errors.push('No valid lectures detected in the provided timetable document.');
  }

  return {
    isValid: errors.length === 0,
    data: {
      timetable: sanitizedTimetable,
      metadata
    },
    errors
  };
};
