/**
 * Pure calculation utilities for attendance percentages, metrics, predictions, and live state recalculations.
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
 * Calculates number of consecutive lectures required to reach target percentage (default 75%).
 * Also calculates safe skips if current attendance >= target percentage.
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
 */
export function recalculateSubjectStatsOptimistic(currentSubjectStats = [], targetSubjectId, oldStatus, newStatus, targetPercentage = 75) {
  if (!targetSubjectId || oldStatus === newStatus) return currentSubjectStats;

  return currentSubjectStats.map((sub) => {
    if (String(sub.subject_id) !== String(targetSubjectId)) {
      return sub;
    }

    let present = Number(sub.present) || 0;
    let absent = Number(sub.absent) || 0;

    if (oldStatus === 'present') present = Math.max(0, present - 1);
    if (oldStatus === 'absent') absent = Math.max(0, absent - 1);

    if (newStatus === 'present') present += 1;
    if (newStatus === 'absent') absent += 1;

    const totalLectures = Number(sub.total_lectures) || 0;
    const metrics = calculateAttendanceMetrics(present, absent, totalLectures);
    const prediction = calculateRequiredLectures(present, metrics.marked, targetPercentage);

    return {
      ...sub,
      present: metrics.present,
      absent: metrics.absent,
      pending: metrics.pending,
      remaining_lectures: metrics.remaining_lectures,
      attendance_percentage: metrics.percentage,
      prediction,
    };
  });
}

/**
 * Optimistically recalculates overall stats when a lecture changes status
 */
export function recalculateOverallStatsOptimistic(currentOverall = {}, oldStatus, newStatus, targetPercentage = 75) {
  if (oldStatus === newStatus || !currentOverall) return currentOverall;

  let totalPresent = Number(currentOverall.total_present) || 0;
  let totalAbsent = Number(currentOverall.total_absent) || 0;

  if (oldStatus === 'present') totalPresent = Math.max(0, totalPresent - 1);
  if (oldStatus === 'absent') totalAbsent = Math.max(0, totalAbsent - 1);

  if (newStatus === 'present') totalPresent += 1;
  if (newStatus === 'absent') totalAbsent += 1;

  const totalLectures = Number(currentOverall.total_lectures) || 0;
  const metrics = calculateAttendanceMetrics(totalPresent, totalAbsent, totalLectures);
  const prediction = calculateRequiredLectures(totalPresent, metrics.marked, targetPercentage);

  return {
    ...currentOverall,
    total_present: metrics.present,
    total_absent: metrics.absent,
    total_pending: metrics.pending,
    remaining_lectures: metrics.remaining_lectures,
    overall_attendance_percentage: metrics.percentage,
    prediction,
  };
}
