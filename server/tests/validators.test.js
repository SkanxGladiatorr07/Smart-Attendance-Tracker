/**
 * @file validators.test.js
 * @description Server-side unit tests for input validators and date utilities.
 *
 * Run: node --test server/tests/validators.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidDate,
  isValidTime,
  timeToSeconds,
  isTimeRangeValid,
  getTodayISO,
  getMonthStartEnd,
} from '../src/utils/dateUtils.js';

// =============================================================================
// isValidDate
// =============================================================================

describe('Server: isValidDate', () => {
  it('accepts valid ISO dates', () => {
    assert.strictEqual(isValidDate('2026-01-15'), true);
    assert.strictEqual(isValidDate('2026-12-31'), true);
  });

  it('rejects non-ISO formats', () => {
    assert.strictEqual(isValidDate('15-01-2026'), false);
    assert.strictEqual(isValidDate('2026/01/15'), false);
    assert.strictEqual(isValidDate('January 15'), false);
  });

  it('rejects null, undefined, and empty string', () => {
    assert.strictEqual(isValidDate(null), false);
    assert.strictEqual(isValidDate(undefined), false);
    assert.strictEqual(isValidDate(''), false);
  });

  it('rejects numbers and objects', () => {
    assert.strictEqual(isValidDate(42), false);
    assert.strictEqual(isValidDate({}), false);
  });

  it('rejects impossible dates', () => {
    assert.strictEqual(isValidDate('2026-02-30'), false);
    assert.strictEqual(isValidDate('2026-13-01'), false);
    assert.strictEqual(isValidDate('2026-00-15'), false);
  });
});

// =============================================================================
// isValidTime
// =============================================================================

describe('Server: isValidTime', () => {
  it('accepts valid 24h time strings', () => {
    assert.strictEqual(isValidTime('00:00'), true);
    assert.strictEqual(isValidTime('23:59'), true);
    assert.strictEqual(isValidTime('09:30:45'), true);
  });

  it('rejects invalid times', () => {
    assert.strictEqual(isValidTime('25:00'), false);
    assert.strictEqual(isValidTime('12:60'), false);
    assert.strictEqual(isValidTime('9am'), false);
    assert.strictEqual(isValidTime(''), false);
    assert.strictEqual(isValidTime(null), false);
  });
});

// =============================================================================
// timeToSeconds
// =============================================================================

describe('Server: timeToSeconds', () => {
  it('converts HH:MM to seconds', () => {
    assert.strictEqual(timeToSeconds('01:00'), 3600);
    assert.strictEqual(timeToSeconds('00:30'), 1800);
  });

  it('converts HH:MM:SS to seconds', () => {
    assert.strictEqual(timeToSeconds('01:00:30'), 3630);
  });

  it('returns 0 for invalid time', () => {
    assert.strictEqual(timeToSeconds('invalid'), 0);
    assert.strictEqual(timeToSeconds(''), 0);
  });
});

// =============================================================================
// isTimeRangeValid
// =============================================================================

describe('Server: isTimeRangeValid', () => {
  it('returns true when start is before end', () => {
    assert.strictEqual(isTimeRangeValid('09:00', '10:00'), true);
  });

  it('returns false when start equals end', () => {
    assert.strictEqual(isTimeRangeValid('10:00', '10:00'), false);
  });

  it('returns false when start is after end', () => {
    assert.strictEqual(isTimeRangeValid('11:00', '10:00'), false);
  });

  it('returns false for invalid inputs', () => {
    assert.strictEqual(isTimeRangeValid('invalid', '10:00'), false);
  });
});

// =============================================================================
// getTodayISO
// =============================================================================

describe('Server: getTodayISO', () => {
  it('returns a valid YYYY-MM-DD string', () => {
    const today = getTodayISO();
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(today));
    assert.strictEqual(isValidDate(today), true);
  });
});

// =============================================================================
// getMonthStartEnd
// =============================================================================

describe('Server: getMonthStartEnd', () => {
  it('returns correct start and end for a normal month', () => {
    const result = getMonthStartEnd('2026-07');
    assert.strictEqual(result.startDate, '2026-07-01');
    assert.strictEqual(result.endDate, '2026-07-31');
  });

  it('handles February (non-leap year)', () => {
    const result = getMonthStartEnd('2026-02');
    assert.strictEqual(result.startDate, '2026-02-01');
    assert.strictEqual(result.endDate, '2026-02-28');
  });

  it('handles February (leap year)', () => {
    const result = getMonthStartEnd('2028-02');
    assert.strictEqual(result.endDate, '2028-02-29');
  });

  it('returns null for invalid format', () => {
    assert.strictEqual(getMonthStartEnd('July 2026'), null);
    assert.strictEqual(getMonthStartEnd('2026-7'), null);
    assert.strictEqual(getMonthStartEnd(null), null);
  });
});
