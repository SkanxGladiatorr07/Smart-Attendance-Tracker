/**
 * Pure calculation utilities for attendance percentages, metrics, predictions, safe skips, recommendations, and live state recalculations.
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
 * Calculates maximum number of future lectures a student can safely miss while remaining at/above target % (default 75%).
 */
export function calculateSafeSkips(present = 0, marked = 0, targetPercentage = 75, remainingLectures = null) {
  const P = Number(present) || 0;
  const M = Number(marked) || 0;
  const target = Number(targetPercentage) || 75;
  const targetFrac = target / 100;

  if (M <= 0) {
    return {
      currentPercentage: 0,
      targetPercentage: target,
      safeSkips: 0,
      effectiveSafeSkips: 0,
      canSkip: false,
      status: 'no_data',
      message: 'No lectures marked yet.',
    };
  }

  const currentPercentage = calculatePercentage(P, M);

  if (currentPercentage < target) {
    return {
      currentPercentage,
      targetPercentage: target,
      safeSkips: 0,
      effectiveSafeSkips: 0,
      canSkip: false,
      status: 'below_target',
      message: `Current attendance (${currentPercentage}%) is below target (${target}%). 0 safe skips available.`,
    };
  }

  const rawSkips = Math.floor((P - targetFrac * M) / targetFrac);
  const safeSkips = Math.max(0, rawSkips);

  let effectiveSafeSkips = safeSkips;
  if (remainingLectures !== null && remainingLectures !== undefined) {
    const rem = Number(remainingLectures) || 0;
    effectiveSafeSkips = Math.min(safeSkips, rem);
  }

  return {
    currentPercentage,
    targetPercentage: target,
    safeSkips,
    effectiveSafeSkips,
    canSkip: safeSkips > 0,
    status: safeSkips > 0 ? 'available' : 'at_boundary',
    message: safeSkips > 0
      ? `You can safely miss up to ${safeSkips} future lecture(s) while staying above ${target}%.`
      : `Current attendance (${currentPercentage}%) is at boundary. 0 safe skips available.`,
  };
}

/**
 * Generates AI-assisted recommendation decision for a scheduled lecture
 */
export function generateLectureRecommendation(subjectStats = {}, lecture = {}, targetPercentage = 75) {
  const currentPct = Number(subjectStats.attendance_percentage) || 0;
  const present = Number(subjectStats.present) || 0;
  const absent = Number(subjectStats.absent) || 0;
  const marked = (subjectStats.marked !== undefined) ? Number(subjectStats.marked) : (present + absent);
  const remaining = Number(subjectStats.remaining_lectures) || 0;
  const target = Number(targetPercentage) || 75;

  const pred = subjectStats.prediction || calculateRequiredLectures(present, marked, target);
  const skips = subjectStats.safeSkips || calculateSafeSkips(present, marked, target, remaining);

  const pctIfSkipped = calculatePercentage(present, marked + 1);

  let level = 'RECOMMENDED';
  let badgeColor = 'amber';
  let title = 'Recommended';
  let reason = '';
  let priority = 2;

  // Rule 1: MUST ATTEND (Red)
  if (currentPct < target || pctIfSkipped < target || skips.safeSkips === 0) {
    level = 'MUST_ATTEND';
    badgeColor = 'rose';
    title = 'Must Attend';
    priority = 1;

    if (currentPct < target) {
      reason = `Current attendance is ${currentPct}% (below ${target}% target). You must attend this lecture to build towards target (${pred.requiredLectures} consecutive lectures required).`;
    } else if (pctIfSkipped < target) {
      reason = `Current attendance is ${currentPct}%. Skipping today will drop your attendance to ${pctIfSkipped}% (below ${target}% target). Must attend!`;
    } else {
      reason = `You are at the ${target}% boundary with 0 safe skips remaining. Must attend to preserve your safe margin!`;
    }
  }
  // Rule 2: SAFE TO SKIP (Green)
  else if (currentPct > 80 && skips.safeSkips >= 2) {
    level = 'SAFE_TO_SKIP';
    badgeColor = 'emerald';
    title = 'Safe to Skip';
    priority = 3;
    reason = `Attendance is healthy at ${currentPct}% with ${skips.safeSkips} safe skips available (${remaining} remaining lectures in semester). Skipping today leaves your attendance at ${pctIfSkipped}%.`;
  }
  // Rule 3: RECOMMENDED (Yellow)
  else {
    level = 'RECOMMENDED';
    badgeColor = 'amber';
    title = 'Recommended';
    priority = 2;
    reason = `Attendance is at ${currentPct}% with ${skips.safeSkips} safe skip remaining. Attending today is recommended to strengthen your safety buffer.`;
  }

  return {
    lecture_id: lecture.id || lecture.lecture_id,
    subject_id: subjectStats.subject_id || lecture.subject_id,
    subject_name: subjectStats.subject_name || lecture.subject_name || 'Subject',
    faculty_name: subjectStats.faculty_name || lecture.faculty_name,
    color: subjectStats.color || lecture.color || '#6366f1',
    start_time: lecture.lecture_start || lecture.start_time,
    end_time: lecture.lecture_end || lecture.end_time,
    startTimeFormatted: lecture.startTimeFormatted,
    endTimeFormatted: lecture.endTimeFormatted,
    room_number: lecture.room_number,
    lecture_type: lecture.lecture_type,
    attendance_status: lecture.attendance_status || 'pending',
    current_percentage: currentPct,
    pct_if_skipped: pctIfSkipped,
    target_percentage: target,
    remaining_lectures: remaining,
    safe_skips: skips.safeSkips,
    required_lectures: pred.requiredLectures,
    level,
    badgeColor,
    title,
    reason,
    priority,
  };
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
    const safeSkips = calculateSafeSkips(present, metrics.marked, targetPercentage, metrics.remaining_lectures);

    return {
      ...sub,
      present: metrics.present,
      absent: metrics.absent,
      pending: metrics.pending,
      remaining_lectures: metrics.remaining_lectures,
      attendance_percentage: metrics.percentage,
      prediction,
      safeSkips,
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
  const safeSkips = calculateSafeSkips(totalPresent, metrics.marked, targetPercentage, metrics.remaining_lectures);

  return {
    ...currentOverall,
    total_present: metrics.present,
    total_absent: metrics.absent,
    total_pending: metrics.pending,
    remaining_lectures: metrics.remaining_lectures,
    overall_attendance_percentage: metrics.percentage,
    prediction,
    safeSkips,
  };
}
