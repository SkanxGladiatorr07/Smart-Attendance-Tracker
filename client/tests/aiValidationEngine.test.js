/**
 * @file aiValidationEngine.test.js
 * @description Unit tests for the AI Validation Layer — validates AI-generated
 * calendar and timetable JSON payloads before database import.
 *
 * Covers:
 * - validateAiTimetable: empty inputs, missing fields, invalid times, overlapping lectures
 * - validateAiAcademicCalendar: missing dates, invalid ranges, duplicate holidays
 */

import { describe, it, expect } from 'vitest';
import {
  validateAiTimetable,
  validateAiAcademicCalendar,
  isValidDate,
  isValidTime,
} from '../src/utils/aiValidationEngine.js';

// =============================================================================
// isValidDate / isValidTime helpers
// =============================================================================

describe('isValidDate', () => {
  it('accepts valid dates', () => {
    expect(isValidDate('2026-01-15')).toBe(true);
    expect(isValidDate('2026-12-31')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidDate('15-01-2026')).toBe(false);
    expect(isValidDate('2026/01/15')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });

  it('rejects impossible dates (e.g. Feb 30 or month out of range)', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('2026-00-15')).toBe(false);
  });
});

describe('isValidTime', () => {
  it('accepts valid 24h times', () => {
    expect(isValidTime('09:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('09:00:30')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidTime('25:00')).toBe(false);
    expect(isValidTime('9am')).toBe(false);
    expect(isValidTime('')).toBe(false);
    expect(isValidTime(null)).toBe(false);
  });
});

// =============================================================================
// validateAiTimetable
// =============================================================================

describe('validateAiTimetable', () => {
  it('rejects null/undefined input', () => {
    const result = validateAiTimetable(null);
    expect(result.isValid).toBe(false);
    expect(result.hasErrors).toBe(true);
  });

  it('accepts a valid minimal timetable', () => {
    const result = validateAiTimetable({
      Monday: [{ subject: 'Math', startTime: '09:00', endTime: '10:00' }],
    });
    expect(result.isValid).toBe(true);
    expect(result.hasErrors).toBe(false);
    expect(result.sanitizedData.metadata.totalLectures).toBe(1);
    expect(result.sanitizedData.metadata.detectedSubjects).toContain('Math');
  });

  it('flags empty subject name', () => {
    const result = validateAiTimetable({
      Monday: [{ subject: '', startTime: '09:00', endTime: '10:00' }],
    });
    expect(result.hasErrors).toBe(true);
    const subjectIssue = result.issues.find(i => i.field === 'subject');
    expect(subjectIssue).toBeDefined();
    expect(subjectIssue.severity).toBe('ERROR');
  });

  it('flags invalid start time', () => {
    const result = validateAiTimetable({
      Monday: [{ subject: 'Math', startTime: 'invalid', endTime: '10:00' }],
    });
    expect(result.hasErrors).toBe(true);
    expect(result.issues.some(i => i.field === 'startTime')).toBe(true);
  });

  it('flags start time after end time', () => {
    const result = validateAiTimetable({
      Monday: [{ subject: 'Math', startTime: '11:00', endTime: '10:00' }],
    });
    const rangeIssue = result.issues.find(i => i.field === 'timeRange');
    expect(rangeIssue).toBeDefined();
    expect(rangeIssue.severity).toBe('ERROR');
  });

  it('warns about unusually short lectures', () => {
    const result = validateAiTimetable({
      Monday: [{ subject: 'Math', startTime: '09:00', endTime: '09:10' }],
    });
    expect(result.hasWarnings).toBe(true);
    const shortIssue = result.issues.find(i => i.field === 'duration');
    expect(shortIssue.severity).toBe('WARNING');
  });

  it('detects overlapping lectures', () => {
    const result = validateAiTimetable({
      Monday: [
        { subject: 'Math', startTime: '09:00', endTime: '10:00' },
        { subject: 'Physics', startTime: '09:30', endTime: '10:30' },
      ],
    });
    const overlapIssue = result.issues.find(i => i.field === 'overlap');
    expect(overlapIssue).toBeDefined();
    expect(overlapIssue.severity).toBe('ERROR');
  });

  it('passes with non-overlapping lectures', () => {
    const result = validateAiTimetable({
      Monday: [
        { subject: 'Math', startTime: '09:00', endTime: '10:00' },
        { subject: 'Physics', startTime: '10:00', endTime: '11:00' },
      ],
    });
    const overlapIssues = result.issues.filter(i => i.field === 'overlap');
    expect(overlapIssues.length).toBe(0);
  });

  it('handles wrapped timetable objects', () => {
    const result = validateAiTimetable({
      timetable: {
        Monday: [{ subject: 'Math', startTime: '09:00', endTime: '10:00' }],
      },
    });
    expect(result.isValid).toBe(true);
  });

  it('handles case-insensitive day keys', () => {
    const result = validateAiTimetable({
      monday: [{ subject: 'Math', startTime: '09:00', endTime: '10:00' }],
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData.timetable.Monday.length).toBe(1);
  });
});

// =============================================================================
// validateAiAcademicCalendar
// =============================================================================

describe('validateAiAcademicCalendar', () => {
  it('rejects null/undefined input', () => {
    const result = validateAiAcademicCalendar(null);
    expect(result.isValid).toBe(false);
    expect(result.hasErrors).toBe(true);
  });

  it('accepts a valid minimal calendar', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-07-01',
      semesterEnd: '2026-11-30',
      holidays: [],
    });
    expect(result.isValid).toBe(true);
    expect(result.hasErrors).toBe(false);
  });

  it('flags missing semesterStart', () => {
    const result = validateAiAcademicCalendar({
      semesterEnd: '2026-11-30',
    });
    expect(result.hasErrors).toBe(true);
    expect(result.issues.some(i => i.field === 'semesterStart')).toBe(true);
  });

  it('flags missing semesterEnd', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-07-01',
    });
    expect(result.hasErrors).toBe(true);
    expect(result.issues.some(i => i.field === 'semesterEnd')).toBe(true);
  });

  it('flags invalid date formats', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '07-01-2026',
      semesterEnd: '2026-11-30',
    });
    expect(result.hasErrors).toBe(true);
  });

  it('flags semesterStart after semesterEnd', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-12-01',
      semesterEnd: '2026-07-01',
    });
    expect(result.hasErrors).toBe(true);
    const rangeIssue = result.issues.find(i => i.field === 'semesterRange');
    expect(rangeIssue).toBeDefined();
  });

  it('warns about unusually short semester', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-07-01',
      semesterEnd: '2026-07-15',
    });
    expect(result.hasWarnings).toBe(true);
    expect(result.issues.some(i => i.id === 'warn_sem_short')).toBe(true);
  });

  it('warns about semester longer than a year', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2025-01-01',
      semesterEnd: '2026-07-01',
    });
    expect(result.hasWarnings).toBe(true);
    expect(result.issues.some(i => i.id === 'warn_sem_long')).toBe(true);
  });

  it('flags invalid holiday dates', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-07-01',
      semesterEnd: '2026-11-30',
      holidays: [
        { name: 'Independence Day', date: 'invalid-date' },
      ],
    });
    expect(result.hasErrors).toBe(true);
  });

  it('warns about duplicate holidays', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-07-01',
      semesterEnd: '2026-11-30',
      holidays: [
        { name: 'Independence Day', date: '2026-08-15' },
        { name: 'National Holiday', date: '2026-08-15' },
      ],
    });
    expect(result.hasWarnings).toBe(true);
    const dupIssue = result.issues.find(i => i.id.startsWith('warn_holiday_dup'));
    expect(dupIssue).toBeDefined();
  });

  it('includes sanitized data on valid input', () => {
    const result = validateAiAcademicCalendar({
      semesterStart: '2026-07-01',
      semesterEnd: '2026-11-30',
      holidays: [{ name: 'Diwali', date: '2026-10-20' }],
      workingSaturdays: ['2026-09-05'],
    });
    expect(result.sanitizedData).toBeDefined();
    expect(result.sanitizedData.semesterStart).toBe('2026-07-01');
    expect(result.sanitizedData.holidays.length).toBe(1);
    expect(result.sanitizedData.workingSaturdays.length).toBe(1);
  });
});
