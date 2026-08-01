/**
 * @file calcUtils.js
 * @module attendai/client/calcUtils
 * @description Pure calculation utilities for attendance percentages, metrics, predictions,
 * safe skip calculations, AI-assisted recommendations, and optimistic live state recalculations.
 *
 * These functions are intentionally pure (no side effects, no API calls) and are safe
 * to use in both React components and test environments.
 */

/**
 * Calculates percentage value rounded to specified decimal places.
 * Returns 0 to prevent division-by-zero errors.
 *
 * @param {number} numerator - Count of present items
 * @param {number} denominator - Total count of marked items
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {number} Calculated percentage (0–100)
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
 * Calculates the number of consecutive lectures required to reach a target attendance percentage.
 * Also calculates safe skips if the current attendance already meets the target.
 *
 * @param {number} [present=0] - Count of present lectures
 * @param {number} [marked=0] - Total count of marked lectures (present + absent)
 * @param {number} [targetPercentage=75] - Target attendance percentage
 * @returns {{ currentPercentage: number, targetPercentage: number, requiredLectures: number,
 *             safeSkips: number, isTargetAchieved: boolean, status: string, message: string }}
 */
export function calculateRequiredLectures(present = 0, marked = 0, targetPercentage = 75) {
  const presentCount = Number(present) || 0;
  const markedCount = Number(marked) || 0;
  const target = Number(targetPercentage) || 75;
  const targetFrac = target / 100;

  if (markedCount <= 0) {
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

  const currentPercentage = calculatePercentage(presentCount, markedCount);

  if (currentPercentage >= target) {
    // Formula: safeSkips = floor((present - target * marked) / target)
    const safeSkips = Math.floor((presentCount - targetFrac * markedCount) / targetFrac);
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
  }

  // Formula: needed = ceil((target * marked - present) / (1 - target))
  const needed = Math.ceil((targetFrac * markedCount - presentCount) / (1 - targetFrac));
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

/**
 * Calculates the maximum number of future lectures a student can safely miss
 * while remaining at or above the target attendance percentage.
 *
 * @param {number} [present=0] - Count of present lectures
 * @param {number} [marked=0] - Total count of marked lectures
 * @param {number} [targetPercentage=75] - Target attendance percentage
 * @param {number|null} [remainingLectures=null] - Optional remaining lectures in the semester
 * @returns {{ currentPercentage: number, targetPercentage: number, safeSkips: number,
 *             effectiveSafeSkips: number, canSkip: boolean, status: string, message: string }}
 */
export function calculateSafeSkips(present = 0, marked = 0, targetPercentage = 75, remainingLectures = null) {
  const presentCount = Number(present) || 0;
  const markedCount = Number(marked) || 0;
  const target = Number(targetPercentage) || 75;
  const targetFrac = target / 100;

  if (markedCount <= 0) {
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

  const currentPercentage = calculatePercentage(presentCount, markedCount);

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

  // Formula: S = floor((present - target * marked) / target)
  const rawSkips = Math.floor((presentCount - targetFrac * markedCount) / targetFrac);
  const safeSkips = Math.max(0, rawSkips);

  // Cap effective skips against remaining lectures if provided
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
 * Generates an AI-assisted attendance recommendation for a single scheduled lecture.
 * Rules:
 *  - MUST_ATTEND (red):   attendance below target, or skipping would drop below target, or 0 safe skips left
 *  - RECOMMENDED (amber): attendance above target but buffer is thin (< 2 safe skips)
 *  - SAFE_TO_SKIP (green): attendance above 80% with ≥ 2 safe skips available
 *
 * @param {Object} [subjectStat={}] - Calculated subject statistics object
 * @param {Object} [lecture={}] - Scheduled lecture details
 * @param {number} [targetPercentage=75] - Target attendance percentage
 * @returns {Object} Structured recommendation object with level, reason, priority, and lecture metadata
 */
export function generateLectureRecommendation(subjectStat = {}, lecture = {}, targetPercentage = 75) {
  const currentPct = Number(subjectStat.attendance_percentage) || 0;
  const presentCount = Number(subjectStat.present) || 0;
  const absentCount = Number(subjectStat.absent) || 0;
  const markedCount = (subjectStat.marked !== undefined)
    ? Number(subjectStat.marked)
    : (presentCount + absentCount);
  const remaining = Number(subjectStat.remaining_lectures) || 0;
  const target = Number(targetPercentage) || 75;

  // Use pre-calculated prediction/safeSkips from stats if available, else compute fresh
  const prediction = subjectStat.prediction || calculateRequiredLectures(presentCount, markedCount, target);
  const skipCalc = subjectStat.safeSkips || calculateSafeSkips(presentCount, markedCount, target, remaining);

  const pctIfSkipped = calculatePercentage(presentCount, markedCount + 1);

  let level = 'RECOMMENDED';
  let badgeColor = 'amber';
  let title = 'Recommended';
  let reason = '';
  let priority = 2;

  // Rule 1: MUST ATTEND — attendance below target, or skipping drops it below, or 0 safe skips
  if (currentPct < target || pctIfSkipped < target || skipCalc.safeSkips === 0) {
    level = 'MUST_ATTEND';
    badgeColor = 'rose';
    title = 'Must Attend';
    priority = 1;

    if (currentPct < target) {
      reason = `Current attendance is ${currentPct}% (below ${target}% target). You must attend this lecture to build towards target (${prediction.requiredLectures} consecutive lectures required).`;
    } else if (pctIfSkipped < target) {
      reason = `Current attendance is ${currentPct}%. Skipping today will drop your attendance to ${pctIfSkipped}% (below ${target}% target). Must attend!`;
    } else {
      reason = `You are at the ${target}% boundary with 0 safe skips remaining. Must attend to preserve your safe margin!`;
    }
  }
  // Rule 2: SAFE TO SKIP — well above target with comfortable buffer
  else if (currentPct > 80 && skipCalc.safeSkips >= 2) {
    level = 'SAFE_TO_SKIP';
    badgeColor = 'emerald';
    title = 'Safe to Skip';
    priority = 3;
    reason = `Attendance is healthy at ${currentPct}% with ${skipCalc.safeSkips} safe skips available (${remaining} remaining lectures in semester). Skipping today leaves your attendance at ${pctIfSkipped}%.`;
  }
  // Rule 3: RECOMMENDED — meets target but buffer is thin
  else {
    reason = `Attendance is at ${currentPct}% with ${skipCalc.safeSkips} safe skip remaining. Attending today is recommended to strengthen your safety buffer.`;
  }

  return {
    lecture_id: lecture.id || lecture.lecture_id,
    subject_id: subjectStat.subject_id || lecture.subject_id,
    subject_name: subjectStat.subject_name || lecture.subject_name || 'Subject',
    faculty_name: subjectStat.faculty_name || lecture.faculty_name,
    color: subjectStat.color || lecture.color || '#6366f1',
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
    safe_skips: skipCalc.safeSkips,
    required_lectures: prediction.requiredLectures,
    level,
    badgeColor,
    title,
    reason,
    priority,
  };
}

/**
 * Computes an attendance summary metrics object from raw counts.
 *
 * @param {number} [present=0] - Count of present lectures
 * @param {number} [absent=0] - Count of absent lectures
 * @param {number} [totalLectures=0] - Total scheduled lectures
 * @returns {{ totalLectures: number, present: number, absent: number, pending: number,
 *             remaining_lectures: number, marked: number, percentage: number }}
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
 * Optimistically recalculates a subject stats list when a single lecture changes status.
 * Used for instant UI updates without waiting for an API round-trip.
 *
 * @param {Array<Object>} currentSubjectStats - Current subject stats array from context
 * @param {string|number} targetSubjectId - Subject ID whose stats should be updated
 * @param {'present'|'absent'|'pending'} oldStatus - Previous attendance status
 * @param {'present'|'absent'|'pending'} newStatus - New attendance status
 * @param {number} [targetPercentage=75] - Attendance target percentage
 * @returns {Array<Object>} Updated subject stats array
 */
export function recalculateSubjectStatsOptimistic(
  currentSubjectStats = [],
  targetSubjectId,
  oldStatus,
  newStatus,
  targetPercentage = 75
) {
  if (!targetSubjectId || oldStatus === newStatus) return currentSubjectStats;

  return currentSubjectStats.map((subject) => {
    if (String(subject.subject_id) !== String(targetSubjectId)) return subject;

    let presentCount = Number(subject.present) || 0;
    let absentCount = Number(subject.absent) || 0;

    // Undo old status
    if (oldStatus === 'present') presentCount = Math.max(0, presentCount - 1);
    if (oldStatus === 'absent') absentCount = Math.max(0, absentCount - 1);

    // Apply new status
    if (newStatus === 'present') presentCount += 1;
    if (newStatus === 'absent') absentCount += 1;

    const totalLectures = Number(subject.total_lectures) || 0;
    const metrics = calculateAttendanceMetrics(presentCount, absentCount, totalLectures);
    const prediction = calculateRequiredLectures(presentCount, metrics.marked, targetPercentage);
    const safeSkips = calculateSafeSkips(presentCount, metrics.marked, targetPercentage, metrics.remaining_lectures);

    return {
      ...subject,
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
 * Optimistically recalculates overall attendance stats when a single lecture changes status.
 * Used for instant UI updates without waiting for an API round-trip.
 *
 * @param {Object} currentOverall - Current overall stats object from context
 * @param {'present'|'absent'|'pending'} oldStatus - Previous attendance status
 * @param {'present'|'absent'|'pending'} newStatus - New attendance status
 * @param {number} [targetPercentage=75] - Attendance target percentage
 * @returns {Object} Updated overall stats object
 */
export function recalculateOverallStatsOptimistic(
  currentOverall = {},
  oldStatus,
  newStatus,
  targetPercentage = 75
) {
  if (oldStatus === newStatus || !currentOverall) return currentOverall;

  let totalPresent = Number(currentOverall.total_present) || 0;
  let totalAbsent = Number(currentOverall.total_absent) || 0;

  // Undo old status
  if (oldStatus === 'present') totalPresent = Math.max(0, totalPresent - 1);
  if (oldStatus === 'absent') totalAbsent = Math.max(0, totalAbsent - 1);

  // Apply new status
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
