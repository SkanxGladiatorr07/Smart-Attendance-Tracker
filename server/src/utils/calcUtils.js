/**
 * Calculation Utilities - Pure helper functions for attendance percentages, metrics, and DB row transformations.
 */

/**
 * Safely calculates percentage value rounded to specified decimal places
 * Prevents Division-by-Zero errors
 * @param {number} numerator - Count of present items
 * @param {number} denominator - Total count of marked items
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {number} Calculated percentage
 */
export function calculatePercentage(numerator, denominator, decimals = 2) {
  const num = Number(numerator) || 0;
  const den = Number(denominator) || 0;
  if (den <= 0) return 0;
  const rawPercentage = (num / den) * 100;
  const factor = Math.pow(10, decimals);
  return Math.round(rawPercentage * factor) / factor;
}

/**
 * Computes attendance summary metrics object
 * @param {number} present - Count of present lectures
 * @param {number} absent - Count of absent lectures
 * @param {number} totalLectures - Total scheduled lectures
 * @returns {Object} Calculated metrics
 */
export function calculateAttendanceMetrics(present = 0, absent = 0, totalLectures = 0) {
  const presentCount = Number(present) || 0;
  const absentCount = Number(absent) || 0;
  const totalCount = Number(totalLectures) || 0;
  const markedCount = presentCount + absentCount;
  const pendingCount = Math.max(0, totalCount - markedCount);

  const percentage = calculatePercentage(presentCount, markedCount);

  return {
    totalLectures: totalCount,
    present: presentCount,
    absent: absentCount,
    pending: pendingCount,
    marked: markedCount,
    percentage,
  };
}

/**
 * Formats raw MySQL database row into clean subject statistics object
 * @param {Object} row - Raw MySQL result row
 * @returns {Object} Formatted subject statistics object
 */
export function formatSubjectStatsRow(row) {
  const totalLectures = Number(row.total_lectures) || 0;
  const present = Number(row.present) || 0;
  const absent = Number(row.absent) || 0;
  const pending = Number(row.pending) || 0;
  const metrics = calculateAttendanceMetrics(present, absent, totalLectures);

  return {
    subject_id: row.subject_id,
    subject_name: row.subject_name || '',
    faculty_name: row.faculty_name || '',
    color: row.color || '#6366f1',
    total_lectures: totalLectures,
    present,
    absent,
    pending,
    attendance_percentage: metrics.percentage,
  };
}

/**
 * Formats raw MySQL database row into clean overall statistics object
 * @param {Object} row - Raw MySQL result row
 * @returns {Object} Formatted overall statistics object
 */
export function formatOverallStatsRow(row) {
  const totalLectures = Number(row.total_lectures) || 0;
  const totalPresent = Number(row.total_present) || 0;
  const totalAbsent = Number(row.total_absent) || 0;
  const totalPending = Number(row.total_pending) || 0;
  const metrics = calculateAttendanceMetrics(totalPresent, totalAbsent, totalLectures);

  return {
    total_lectures: totalLectures,
    total_present: totalPresent,
    total_absent: totalAbsent,
    total_pending: totalPending,
    overall_attendance_percentage: metrics.percentage,
  };
}
