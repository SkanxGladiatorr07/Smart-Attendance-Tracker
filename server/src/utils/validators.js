import { AppError } from './AppError.js';
import { isValidDate, isValidTime, isTimeRangeValid } from './dateUtils.js';

export const LECTURE_STATUSES = ['scheduled', 'cancelled', 'extra'];
export const ATTENDANCE_STATUSES = ['present', 'absent', 'pending'];

// Re-export for convenience
export { isValidDate, isValidTime };

/**
 * Validates lecture schedule input payload
 * @param {Object} data - Input data to validate
 * @param {boolean} isUpdate - True if performing partial update
 * @throws {AppError} 400 Bad Request if validation fails
 */
export function validateLectureSchedule(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.subject_id !== undefined) {
    const subjectId = Number(data.subject_id);
    if (!data.subject_id || !Number.isInteger(subjectId) || subjectId <= 0) {
      errors.push('subject_id must be a positive integer');
    }
  }

  if (!isUpdate || data.lecture_date !== undefined) {
    if (!data.lecture_date || !isValidDate(data.lecture_date)) {
      errors.push('lecture_date must be a valid date in YYYY-MM-DD format');
    }
  }

  if (!isUpdate || data.lecture_start !== undefined) {
    if (!data.lecture_start || !isValidTime(data.lecture_start)) {
      errors.push('lecture_start must be a valid time in HH:MM or HH:MM:SS format');
    }
  }

  if (!isUpdate || data.lecture_end !== undefined) {
    if (!data.lecture_end || !isValidTime(data.lecture_end)) {
      errors.push('lecture_end must be a valid time in HH:MM or HH:MM:SS format');
    }
  }

  // If both start and end times are valid, ensure start is before end
  const start = data.lecture_start;
  const end = data.lecture_end;
  if (start && end && isValidTime(start) && isValidTime(end)) {
    if (!isTimeRangeValid(start, end)) {
      errors.push('lecture_start time must be earlier than lecture_end time');
    }
  }

  if (data.lecture_status !== undefined) {
    if (!LECTURE_STATUSES.includes(data.lecture_status)) {
      errors.push(`lecture_status must be one of: ${LECTURE_STATUSES.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    throw new AppError(`Validation error: ${errors.join('; ')}`, 400);
  }
}

/**
 * Validates attendance record input payload
 * @param {Object} data - Input data to validate
 * @param {boolean} isUpdate - True if performing partial update
 * @throws {AppError} 400 Bad Request if validation fails
 */
export function validateAttendanceRecord(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.lecture_id !== undefined) {
    const lectureId = Number(data.lecture_id);
    if (!data.lecture_id || !Number.isInteger(lectureId) || lectureId <= 0) {
      errors.push('lecture_id must be a positive integer');
    }
  }

  if (!isUpdate || data.attendance_status !== undefined) {
    if (!data.attendance_status || !ATTENDANCE_STATUSES.includes(data.attendance_status)) {
      errors.push(`attendance_status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    throw new AppError(`Validation error: ${errors.join('; ')}`, 400);
  }
}
