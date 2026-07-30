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
 * Calculates number of consecutive lectures required to reach target percentage (default 75%).
 * Also calculates safe skips if current attendance >= target percentage.
 * @param {number} present - Count of present lectures
 * @param {number} marked - Count of marked lectures (present + absent)
 * @param {number} [targetPercentage=75] - Target percentage (default 75)
 * @returns {Object} Prediction result
 */
export function calculateRequiredLectures(present = 0, marked = 0, targetPercentage = 75) {
  const P = Number(present) || 0;
  const M = Number(marked) || 0;
  const target = Number(targetPercentage) || 75;
  const targetFrac = target / 100;

  if (M <= 0) {
    return {
      currentPercentage: 0,
      targetPercentage: target,
      requiredLectures: 0,
      safeSkips: 0,
      isTargetAchieved: true,
      status: 'on_track',
      message: `No lectures marked yet. Maintain attendance to stay at target ${target}%.`,
    };
  }

  const currentPercentage = calculatePercentage(P, M);

  if (currentPercentage >= target) {
    const safeSkips = Math.floor((P - targetFrac * M) / targetFrac);
    return {
      currentPercentage,
      targetPercentage: target,
      requiredLectures: 0,
      safeSkips: Math.max(0, safeSkips),
      isTargetAchieved: true,
      status: 'on_track',
      message: safeSkips > 0
        ? `Target met (${currentPercentage}%). You can safely miss ${safeSkips} lecture(s) while staying above ${target}%.`
        : `Target met (${currentPercentage}%). Keep attending to maintain your safe margin!`,
    };
  } else {
    // Formula: X = ceil((T * M - P) / (1 - T))
    const needed = Math.ceil((targetFrac * M - P) / (1 - targetFrac));
    const requiredLectures = Math.max(1, needed);
    return {
      currentPercentage,
      targetPercentage: target,
      requiredLectures,
      safeSkips: 0,
      isTargetAchieved: false,
      status: 'needs_improvement',
      message: `Attend ${requiredLectures} consecutive lecture(s) to reach target ${target}%.`,
    };
  }
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
    remaining_lectures: pendingCount,
    marked: markedCount,
    percentage,
  };
}

/**
 * Formats raw MySQL database row into clean subject statistics object with prediction engine metadata
 * @param {Object} row - Raw MySQL result row
 * @param {number} [targetPercentage=75] - Target percentage for prediction
 * @returns {Object} Formatted subject statistics object
 */
export function formatSubjectStatsRow(row, targetPercentage = 75) {
  const totalLectures = Number(row.total_lectures) || 0;
  const present = Number(row.present) || 0;
  const absent = Number(row.absent) || 0;
  const pending = Number(row.pending) || 0;
  const metrics = calculateAttendanceMetrics(present, absent, totalLectures);
  const prediction = calculateRequiredLectures(present, metrics.marked, targetPercentage);

  return {
    subject_id: row.subject_id,
    subject_name: row.subject_name || '',
    faculty_name: row.faculty_name || '',
    color: row.color || '#6366f1',
    total_lectures: totalLectures,
    present,
    absent,
    pending,
    remaining_lectures: metrics.remaining_lectures,
    marked: metrics.marked,
    attendance_percentage: metrics.percentage,
    prediction,
  };
}

/**
 * Formats raw MySQL database row into clean overall statistics object with prediction engine metadata
 * @param {Object} row - Raw MySQL result row
 * @param {number} [targetPercentage=75] - Target percentage for prediction
 * @returns {Object} Formatted overall statistics object
 */
export function formatOverallStatsRow(row, targetPercentage = 75) {
  const totalLectures = Number(row.total_lectures) || 0;
  const totalPresent = Number(row.total_present) || 0;
  const totalAbsent = Number(row.total_absent) || 0;
  const totalPending = Number(row.total_pending) || 0;
  const metrics = calculateAttendanceMetrics(totalPresent, totalAbsent, totalLectures);
  const prediction = calculateRequiredLectures(totalPresent, metrics.marked, targetPercentage);

  return {
    total_lectures: totalLectures,
    total_present: totalPresent,
    total_absent: totalAbsent,
    total_pending: totalPending,
    remaining_lectures: metrics.remaining_lectures,
    total_marked: metrics.marked,
    overall_attendance_percentage: metrics.percentage,
    prediction,
  };
}
