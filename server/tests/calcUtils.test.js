/**
 * @file calcUtils.test.js
 * @description Server-side unit tests for calculation utilities.
 * Uses Node.js built-in test runner (node:test) — zero external dependencies.
 *
 * Run: node --test server/tests/calcUtils.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePercentage,
  calculateRequiredLectures,
  calculateSafeSkips,
  generateLectureRecommendation,
  calculateAttendanceMetrics,
  formatSubjectStatsRow,
  formatOverallStatsRow,
} from '../src/utils/calcUtils.js';

// =============================================================================
// calculatePercentage
// =============================================================================

describe('Server: calculatePercentage', () => {
  it('handles division by zero', () => {
    assert.strictEqual(calculatePercentage(5, 0), 0);
  });

  it('calculates correct percentage', () => {
    assert.strictEqual(calculatePercentage(3, 4), 75);
  });

  it('rounds to 2 decimals by default', () => {
    assert.strictEqual(calculatePercentage(1, 3), 33.33);
  });
});

// =============================================================================
// calculateRequiredLectures
// =============================================================================

describe('Server: calculateRequiredLectures', () => {
  it('returns 0 required when no lectures marked', () => {
    const r = calculateRequiredLectures(0, 0, 75);
    assert.strictEqual(r.requiredLectures, 0);
    assert.strictEqual(r.isTargetAchieved, true);
  });

  it('calculates correctly when below target', () => {
    const r = calculateRequiredLectures(50, 100, 75);
    assert.strictEqual(r.isTargetAchieved, false);
    assert.strictEqual(r.requiredLectures, 100);
  });

  it('calculates safe skips when above target', () => {
    const r = calculateRequiredLectures(90, 100, 75);
    assert.strictEqual(r.isTargetAchieved, true);
    assert.strictEqual(r.safeSkips, 20);
  });
});

// =============================================================================
// calculateSafeSkips
// =============================================================================

describe('Server: calculateSafeSkips', () => {
  it('returns 0 skips below target', () => {
    const r = calculateSafeSkips(50, 100, 75);
    assert.strictEqual(r.safeSkips, 0);
    assert.strictEqual(r.canSkip, false);
  });

  it('caps against remaining lectures', () => {
    const r = calculateSafeSkips(90, 100, 75, 5);
    assert.strictEqual(r.safeSkips, 20);
    assert.strictEqual(r.effectiveSafeSkips, 5);
  });
});

// =============================================================================
// generateLectureRecommendation
// =============================================================================

describe('Server: generateLectureRecommendation', () => {
  const stat = {
    subject_id: 1, subject_name: 'Math',
    attendance_percentage: 60, present: 60, absent: 40, remaining_lectures: 50,
  };

  it('returns MUST_ATTEND when below target', () => {
    const r = generateLectureRecommendation(stat, { id: 1 }, 75);
    assert.strictEqual(r.level, 'MUST_ATTEND');
    assert.strictEqual(r.priority, 1);
  });

  it('returns SAFE_TO_SKIP when healthy', () => {
    const healthyStat = { ...stat, attendance_percentage: 90, present: 90, absent: 10, marked: 100 };
    const r = generateLectureRecommendation(healthyStat, { id: 1 }, 75);
    assert.strictEqual(r.level, 'SAFE_TO_SKIP');
  });
});

// =============================================================================
// formatSubjectStatsRow
// =============================================================================

describe('Server: formatSubjectStatsRow', () => {
  it('formats raw DB row into structured stats', () => {
    const row = {
      subject_id: 1, subject_name: 'Math', faculty_name: 'Dr. Smith',
      color: '#ff0000', total_lectures: 100, present: 80, absent: 10, pending: 10,
    };
    const result = formatSubjectStatsRow(row, 75);
    assert.strictEqual(result.subject_id, 1);
    assert.strictEqual(result.subject_name, 'Math');
    assert.strictEqual(result.present, 80);
    assert.strictEqual(result.absent, 10);
    assert.strictEqual(result.marked, 90);
    assert.ok(result.attendance_percentage > 0);
    assert.ok(result.prediction);
    assert.ok(result.safeSkips);
  });

  it('uses default color when missing', () => {
    const row = { subject_id: 1, subject_name: 'X', total_lectures: 10, present: 5, absent: 5 };
    const result = formatSubjectStatsRow(row);
    assert.strictEqual(result.color, '#6366f1');
  });
});

// =============================================================================
// formatOverallStatsRow
// =============================================================================

describe('Server: formatOverallStatsRow', () => {
  it('formats raw DB row into structured overall stats', () => {
    const row = {
      total_lectures: 200, total_present: 150, total_absent: 30, total_pending: 20,
    };
    const result = formatOverallStatsRow(row, 75);
    assert.strictEqual(result.total_present, 150);
    assert.strictEqual(result.total_absent, 30);
    assert.strictEqual(result.total_marked, 180);
    assert.ok(result.overall_attendance_percentage > 0);
    assert.ok(result.prediction);
    assert.ok(result.safeSkips);
  });
});

// =============================================================================
// calculateAttendanceMetrics
// =============================================================================

describe('Server: calculateAttendanceMetrics', () => {
  it('calculates summary metrics correctly', () => {
    const result = calculateAttendanceMetrics(80, 10, 100);
    assert.strictEqual(result.present, 80);
    assert.strictEqual(result.absent, 10);
    assert.strictEqual(result.marked, 90);
    assert.strictEqual(result.pending, 10);
  });
});
