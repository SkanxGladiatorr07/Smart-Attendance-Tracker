/**
 * Date and Time Utilities - Pure helper functions for parsing, validating, and converting date/time strings.
 */

// Regex patterns
const DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

/**
 * Validates ISO date format YYYY-MM-DD
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid YYYY-MM-DD date
 */
export function isValidDate(dateStr) {
  if (typeof dateStr !== 'string' || !DATE_REGEX.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validates time format HH:MM or HH:MM:SS (24-hour)
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} True if valid 24hr time string
 */
export function isValidTime(timeStr) {
  return typeof timeStr === 'string' && TIME_REGEX.test(timeStr);
}

/**
 * Converts HH:MM or HH:MM:SS time string to total seconds from start of day
 * @param {string} timeStr - Time string
 * @returns {number} Seconds
 */
export function timeToSeconds(timeStr) {
  if (!isValidTime(timeStr)) return 0;
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
}

/**
 * Checks if start time is strictly earlier than end time
 * @param {string} startTime - HH:MM or HH:MM:SS
 * @param {string} endTime - HH:MM or HH:MM:SS
 * @returns {boolean} True if startTime < endTime
 */
export function isTimeRangeValid(startTime, endTime) {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }
  return timeToSeconds(startTime) < timeToSeconds(endTime);
}

/**
 * Returns current date string formatted as YYYY-MM-DD
 * @returns {string} Current date string
 */
export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates start_date and end_date for a given YYYY-MM month string
 * @param {string} yearMonthStr - Format "YYYY-MM"
 * @returns {{ startDate: string, endDate: string } | null} Start and end dates of month
 */
export function getMonthStartEnd(yearMonthStr) {
  if (typeof yearMonthStr !== 'string' || !/^\d{4}-\d{2}$/.test(yearMonthStr)) {
    return null;
  }
  const [year, month] = yearMonthStr.split('-').map(Number);
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}
