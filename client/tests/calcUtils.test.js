/**
 * @file calcUtils.test.js
 * @description Comprehensive unit tests for the AttendAI client-side calculation utilities.
 *
 * Covers:
 * - calculatePercentage: division-by-zero, rounding, edge cases
 * - calculateRequiredLectures: predictions, safe skips, boundary conditions
 * - calculateSafeSkips: below target, at target, above target, remaining lecture cap
 * - generateLectureRecommendation: MUST_ATTEND / RECOMMENDED / SAFE_TO_SKIP rules
 * - calculateAttendanceMetrics: summary aggregation
 * - recalculateSubjectStatsOptimistic: optimistic UI status transitions
 * - recalculateOverallStatsOptimistic: optimistic UI overall recalculation
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  calculateRequiredLectures,
  calculateSafeSkips,
  generateLectureRecommendation,
  calculateAttendanceMetrics,
  recalculateSubjectStatsOptimistic,
  recalculateOverallStatsOptimistic,
} from '../src/utils/calcUtils.js';

// =============================================================================
// calculatePercentage
// =============================================================================

describe('calculatePercentage', () => {
  it('returns 0 when denominator is 0', () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('returns 0 when denominator is negative', () => {
    expect(calculatePercentage(5, -1)).toBe(0);
  });

  it('returns 100 when numerator equals denominator', () => {
    expect(calculatePercentage(10, 10)).toBe(100);
  });

  it('returns 50 for 1/2', () => {
    expect(calculatePercentage(1, 2)).toBe(50);
  });

  it('rounds to 2 decimals by default', () => {
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it('rounds to custom decimals', () => {
    expect(calculatePercentage(1, 3, 0)).toBe(33);
    expect(calculatePercentage(1, 3, 4)).toBe(33.3333);
  });

  it('handles string inputs gracefully', () => {
    expect(calculatePercentage('7', '10')).toBe(70);
  });

  it('handles null/undefined inputs', () => {
    expect(calculatePercentage(null, undefined)).toBe(0);
  });
});

// =============================================================================
// calculateRequiredLectures
// =============================================================================

describe('calculateRequiredLectures', () => {
  it('returns on_track with 0 required when no lectures marked', () => {
    const result = calculateRequiredLectures(0, 0, 75);
    expect(result.isTargetAchieved).toBe(true);
    expect(result.requiredLectures).toBe(0);
    expect(result.status).toBe('on_track');
  });

  it('returns on_track when attendance is exactly at 75%', () => {
    // 75 present out of 100 = 75%
    const result = calculateRequiredLectures(75, 100, 75);
    expect(result.isTargetAchieved).toBe(true);
    expect(result.currentPercentage).toBe(75);
  });

  it('calculates correct required lectures when below target', () => {
    // 50 present / 100 marked = 50%. Formula: ceil((0.75*100 - 50)/(1-0.75)) = ceil(25/0.25) = 100
    const result = calculateRequiredLectures(50, 100, 75);
    expect(result.isTargetAchieved).toBe(false);
    expect(result.requiredLectures).toBe(100);
    expect(result.status).toBe('needs_improvement');
  });

  it('calculates safe skips when above target', () => {
    // 90 present / 100 marked = 90%. safeSkips = floor((90 - 0.75*100)/0.75) = floor(15/0.75) = 20
    const result = calculateRequiredLectures(90, 100, 75);
    expect(result.isTargetAchieved).toBe(true);
    expect(result.safeSkips).toBe(20);
    expect(result.requiredLectures).toBe(0);
  });

  it('handles 100% attendance', () => {
    const result = calculateRequiredLectures(100, 100, 75);
    expect(result.isTargetAchieved).toBe(true);
    expect(result.currentPercentage).toBe(100);
    expect(result.safeSkips).toBeGreaterThan(0);
  });

  it('handles 0% attendance', () => {
    const result = calculateRequiredLectures(0, 10, 75);
    expect(result.isTargetAchieved).toBe(false);
    expect(result.requiredLectures).toBeGreaterThan(0);
  });

  it('handles custom target percentage', () => {
    const result = calculateRequiredLectures(80, 100, 90);
    expect(result.isTargetAchieved).toBe(false);
    expect(result.targetPercentage).toBe(90);
  });

  it('requires at least 1 lecture when barely below target', () => {
    // 74/100 = 74%. Need ceil((75-74)/0.25) = 4
    const result = calculateRequiredLectures(74, 100, 75);
    expect(result.requiredLectures).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// calculateSafeSkips
// =============================================================================

describe('calculateSafeSkips', () => {
  it('returns no_data when no lectures marked', () => {
    const result = calculateSafeSkips(0, 0, 75);
    expect(result.status).toBe('no_data');
    expect(result.safeSkips).toBe(0);
    expect(result.canSkip).toBe(false);
  });

  it('returns below_target when below target', () => {
    const result = calculateSafeSkips(50, 100, 75);
    expect(result.status).toBe('below_target');
    expect(result.safeSkips).toBe(0);
    expect(result.canSkip).toBe(false);
  });

  it('calculates correct safe skips when above target', () => {
    // 90/100 = 90%. floor((90 - 75)/0.75) = floor(15/0.75) = 20
    const result = calculateSafeSkips(90, 100, 75);
    expect(result.safeSkips).toBe(20);
    expect(result.canSkip).toBe(true);
    expect(result.status).toBe('available');
  });

  it('returns at_boundary when exactly at target', () => {
    // 75/100 = exactly 75%. floor((75-75)/0.75) = 0
    const result = calculateSafeSkips(75, 100, 75);
    expect(result.safeSkips).toBe(0);
    expect(result.status).toBe('at_boundary');
  });

  it('caps effective safe skips against remaining lectures', () => {
    // 90/100 = 90% → 20 safe skips. But only 5 remaining lectures.
    const result = calculateSafeSkips(90, 100, 75, 5);
    expect(result.safeSkips).toBe(20);
    expect(result.effectiveSafeSkips).toBe(5); // capped at remaining
  });

  it('handles null remaining lectures', () => {
    const result = calculateSafeSkips(90, 100, 75, null);
    expect(result.effectiveSafeSkips).toBe(result.safeSkips);
  });
});

// =============================================================================
// generateLectureRecommendation
// =============================================================================

describe('generateLectureRecommendation', () => {
  const makeStat = (pct, present, absent, remaining) => ({
    subject_id: 1,
    subject_name: 'Math',
    attendance_percentage: pct,
    present,
    absent,
    remaining_lectures: remaining,
  });

  const lecture = { id: 101, subject_id: 1, lecture_start: '09:00', lecture_end: '10:00' };

  it('returns MUST_ATTEND when below target', () => {
    const result = generateLectureRecommendation(makeStat(60, 60, 40, 50), lecture, 75);
    expect(result.level).toBe('MUST_ATTEND');
    expect(result.priority).toBe(1);
    expect(result.badgeColor).toBe('rose');
  });

  it('returns MUST_ATTEND when at 0 safe skips boundary', () => {
    // Exactly at 75% boundary → 0 safe skips → MUST_ATTEND
    const stat = makeStat(75, 75, 25, 50);
    stat.marked = 100;
    const result = generateLectureRecommendation(stat, lecture, 75);
    expect(result.level).toBe('MUST_ATTEND');
  });

  it('returns SAFE_TO_SKIP when attendance is healthy', () => {
    // 90% with many safe skips
    const stat = makeStat(90, 90, 10, 50);
    stat.marked = 100;
    const result = generateLectureRecommendation(stat, lecture, 75);
    expect(result.level).toBe('SAFE_TO_SKIP');
    expect(result.priority).toBe(3);
    expect(result.badgeColor).toBe('emerald');
  });

  it('returns RECOMMENDED when attendance is moderate', () => {
    // 77% with exactly 1 safe skip
    const stat = makeStat(77, 77, 23, 50);
    stat.marked = 100;
    const result = generateLectureRecommendation(stat, lecture, 75);
    expect(result.level).toBe('RECOMMENDED');
    expect(result.priority).toBe(2);
  });

  it('includes percentage-if-skipped calculation', () => {
    const stat = makeStat(80, 80, 20, 50);
    stat.marked = 100;
    const result = generateLectureRecommendation(stat, lecture, 75);
    // pctIfSkipped = 80 / 101 ≈ 79.21
    expect(result.pct_if_skipped).toBeCloseTo(79.21, 0);
  });

  it('preserves lecture metadata', () => {
    const result = generateLectureRecommendation(makeStat(90, 90, 10, 50), lecture, 75);
    expect(result.lecture_id).toBe(101);
    expect(result.subject_id).toBe(1);
    expect(result.subject_name).toBe('Math');
    expect(result.start_time).toBe('09:00');
  });
});

// =============================================================================
// calculateAttendanceMetrics
// =============================================================================

describe('calculateAttendanceMetrics', () => {
  it('calculates correct metrics', () => {
    const result = calculateAttendanceMetrics(80, 10, 100);
    expect(result.present).toBe(80);
    expect(result.absent).toBe(10);
    expect(result.marked).toBe(90);
    expect(result.pending).toBe(10);
    expect(result.remaining_lectures).toBe(10);
    expect(result.percentage).toBeCloseTo(88.89, 1);
  });

  it('handles all zeros', () => {
    const result = calculateAttendanceMetrics(0, 0, 0);
    expect(result.percentage).toBe(0);
    expect(result.marked).toBe(0);
    expect(result.pending).toBe(0);
  });

  it('handles when marked exceeds total', () => {
    // Edge case: present+absent > totalLectures
    const result = calculateAttendanceMetrics(60, 50, 100);
    expect(result.marked).toBe(110);
    expect(result.pending).toBe(0); // Math.max(0, 100-110)
  });
});

// =============================================================================
// recalculateSubjectStatsOptimistic
// =============================================================================

describe('recalculateSubjectStatsOptimistic', () => {
  const makeStats = () => [
    {
      subject_id: 1, subject_name: 'Math', present: 40, absent: 10,
      total_lectures: 60, attendance_percentage: 80,
    },
    {
      subject_id: 2, subject_name: 'Physics', present: 30, absent: 20,
      total_lectures: 60, attendance_percentage: 60,
    },
  ];

  it('returns same array if oldStatus === newStatus', () => {
    const stats = makeStats();
    const result = recalculateSubjectStatsOptimistic(stats, 1, 'present', 'present');
    expect(result).toBe(stats); // same reference
  });

  it('returns same array if targetSubjectId is null', () => {
    const stats = makeStats();
    const result = recalculateSubjectStatsOptimistic(stats, null, 'pending', 'present');
    expect(result).toBe(stats);
  });

  it('increments present when marking pending → present', () => {
    const stats = makeStats();
    const result = recalculateSubjectStatsOptimistic(stats, 1, 'pending', 'present');
    const math = result.find(s => s.subject_id === 1);
    expect(math.present).toBe(41);
    expect(math.absent).toBe(10);
  });

  it('decrements present and increments absent for present → absent', () => {
    const stats = makeStats();
    const result = recalculateSubjectStatsOptimistic(stats, 1, 'present', 'absent');
    const math = result.find(s => s.subject_id === 1);
    expect(math.present).toBe(39);
    expect(math.absent).toBe(11);
  });

  it('does not modify other subjects', () => {
    const stats = makeStats();
    const result = recalculateSubjectStatsOptimistic(stats, 1, 'pending', 'present');
    const physics = result.find(s => s.subject_id === 2);
    expect(physics.present).toBe(30);
    expect(physics.absent).toBe(20);
  });

  it('recalculates percentage, prediction, and safeSkips', () => {
    const stats = makeStats();
    const result = recalculateSubjectStatsOptimistic(stats, 1, 'pending', 'present');
    const math = result.find(s => s.subject_id === 1);
    expect(math.attendance_percentage).toBeDefined();
    expect(math.prediction).toBeDefined();
    expect(math.safeSkips).toBeDefined();
  });
});

// =============================================================================
// recalculateOverallStatsOptimistic
// =============================================================================

describe('recalculateOverallStatsOptimistic', () => {
  const makeOverall = () => ({
    total_lectures: 120,
    total_present: 80,
    total_absent: 20,
    total_pending: 20,
    remaining_lectures: 20,
    overall_attendance_percentage: 80,
  });

  it('returns same object if oldStatus === newStatus', () => {
    const overall = makeOverall();
    const result = recalculateOverallStatsOptimistic(overall, 'present', 'present');
    expect(result).toBe(overall);
  });

  it('increments present for pending → present', () => {
    const result = recalculateOverallStatsOptimistic(makeOverall(), 'pending', 'present');
    expect(result.total_present).toBe(81);
    expect(result.total_absent).toBe(20);
  });

  it('swaps present to absent for present → absent', () => {
    const result = recalculateOverallStatsOptimistic(makeOverall(), 'present', 'absent');
    expect(result.total_present).toBe(79);
    expect(result.total_absent).toBe(21);
  });

  it('recalculates percentage', () => {
    const result = recalculateOverallStatsOptimistic(makeOverall(), 'pending', 'present');
    expect(result.overall_attendance_percentage).toBeGreaterThan(80);
  });

  it('includes prediction and safeSkips objects', () => {
    const result = recalculateOverallStatsOptimistic(makeOverall(), 'pending', 'present');
    expect(result.prediction).toBeDefined();
    expect(result.safeSkips).toBeDefined();
  });

  it('handles null overall gracefully', () => {
    const result = recalculateOverallStatsOptimistic(null, 'pending', 'present');
    expect(result).toBeNull();
  });
});
