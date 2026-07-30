/**
 * Pure calculation utilities for attendance percentages, metrics, and live state recalculations.
 */

/**
 * Calculates percentage value rounded to specified decimal places
 * Prevents division by zero
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
 * Optimistically recalculates subject stats list when a lecture changes status
 * @param {Array<Object>} currentSubjectStats 
 * @param {number|string} targetSubjectId 
 * @param {string} oldStatus ('present'|'absent'|'pending')
 * @param {string} newStatus ('present'|'absent'|'pending')
 */
export function recalculateSubjectStatsOptimistic(currentSubjectStats = [], targetSubjectId, oldStatus, newStatus) {
  if (!targetSubjectId || oldStatus === newStatus) return currentSubjectStats;

  return currentSubjectStats.map((sub) => {
    if (String(sub.subject_id) !== String(targetSubjectId)) {
      return sub;
    }

    let present = Number(sub.present) || 0;
    let absent = Number(sub.absent) || 0;

    // Decrement old status count
    if (oldStatus === 'present') present = Math.max(0, present - 1);
    if (oldStatus === 'absent') absent = Math.max(0, absent - 1);

    // Increment new status count
    if (newStatus === 'present') present += 1;
    if (newStatus === 'absent') absent += 1;

    const totalLectures = Number(sub.total_lectures) || 0;
    const metrics = calculateAttendanceMetrics(present, absent, totalLectures);

    return {
      ...sub,
      present: metrics.present,
      absent: metrics.absent,
      pending: metrics.pending,
      remaining_lectures: metrics.remaining_lectures,
      attendance_percentage: metrics.percentage,
    };
  });
}

/**
 * Optimistically recalculates overall stats when a lecture changes status
 * @param {Object} currentOverall 
 * @param {string} oldStatus 
 * @param {string} newStatus 
 */
export function recalculateOverallStatsOptimistic(currentOverall = {}, oldStatus, newStatus) {
  if (oldStatus === newStatus || !currentOverall) return currentOverall;

  let totalPresent = Number(currentOverall.total_present) || 0;
  let totalAbsent = Number(currentOverall.total_absent) || 0;

  if (oldStatus === 'present') totalPresent = Math.max(0, totalPresent - 1);
  if (oldStatus === 'absent') totalAbsent = Math.max(0, totalAbsent - 1);

  if (newStatus === 'present') totalPresent += 1;
  if (newStatus === 'absent') totalAbsent += 1;

  const totalLectures = Number(currentOverall.total_lectures) || 0;
  const metrics = calculateAttendanceMetrics(totalPresent, totalAbsent, totalLectures);

  return {
    ...currentOverall,
    total_present: metrics.present,
    total_absent: metrics.absent,
    total_pending: metrics.pending,
    remaining_lectures: metrics.remaining_lectures,
    overall_attendance_percentage: metrics.percentage,
  };
}
