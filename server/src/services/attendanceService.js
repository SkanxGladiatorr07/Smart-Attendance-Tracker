import { AttendanceRecordModel } from '../models/attendanceRecordModel.js';
import { LectureScheduleModel } from '../models/lectureScheduleModel.js';
import { AppError } from '../utils/AppError.js';
import { validateAttendanceRecord } from '../utils/validators.js';

/**
 * Attendance Service - Handles business logic and validation for attendance operations
 */
export const AttendanceService = {
  /**
   * Get today's attendance records for scheduled lectures
   * @returns {Promise<Array<Object>>} Today's attendance list
   */
  async getTodayAttendance() {
    return await AttendanceRecordModel.findTodayAttendance();
  },

  /**
   * Get historical attendance records with optional filtering
   * @param {Object} [filters] - Optional filters (subject_id, start_date, end_date, attendance_status)
   * @returns {Promise<Array<Object>>} Attendance history list
   */
  async getAttendanceHistory(filters = {}) {
    return await AttendanceRecordModel.findAll(filters);
  },

  /**
   * Mark attendance for a scheduled lecture (creates new record)
   * Enforces strictly ONE attendance record per lecture.
   * @param {Object} data - Attendance mark payload
   * @param {number} data.lecture_id - Target lecture schedule ID
   * @param {string} [data.attendance_status] - Status ('present'|'absent'|'pending')
   * @param {string} [data.status] - Alias for attendance_status
   * @returns {Promise<Object>} Created attendance record
   * @throws {AppError} 404 if lecture not found, 409 if record already exists
   */
  async markAttendance(data) {
    const lecture_id = data.lecture_id;
    const statusVal = data.attendance_status || data.status;

    validateAttendanceRecord({ lecture_id, attendance_status: statusVal });

    // 1. Verify lecture exists in schedule
    const lecture = await LectureScheduleModel.findById(lecture_id);
    if (!lecture) {
      throw new AppError(`Lecture schedule entry with ID ${lecture_id} not found`, 404);
    }

    // 2. Prevent duplicate attendance records for the same lecture
    const existingRecord = await AttendanceRecordModel.findByLectureId(lecture_id);
    if (existingRecord) {
      throw new AppError(
        `Attendance record already exists for lecture ID ${lecture_id}. Use PUT /api/attendance/update to update status.`,
        409
      );
    }

    // 3. Insert attendance record
    return await AttendanceRecordModel.create({
      lecture_id,
      attendance_status: statusVal,
    });
  },

  /**
   * Update existing attendance record by record id or lecture_id
   * @param {Object} data - Update payload
   * @param {number} [data.id] - Attendance record ID
   * @param {number} [data.lecture_id] - Target lecture ID
   * @param {string} [data.attendance_status] - Status ('present'|'absent'|'pending')
   * @param {string} [data.status] - Alias for attendance_status
   * @returns {Promise<Object>} Updated attendance record
   * @throws {AppError} 400 if missing ID/status, 404 if record/lecture not found
   */
  async updateAttendance(data) {
    const { id, lecture_id } = data;
    const statusVal = data.attendance_status || data.status;

    if (!statusVal) {
      throw new AppError('attendance_status (or status) is required', 400);
    }

    if (id) {
      const existing = await AttendanceRecordModel.findById(id);
      if (!existing) {
        throw new AppError(`Attendance record with ID ${id} not found`, 404);
      }
      return await AttendanceRecordModel.update(id, { attendance_status: statusVal });
    }

    if (lecture_id) {
      const lecture = await LectureScheduleModel.findById(lecture_id);
      if (!lecture) {
        throw new AppError(`Lecture schedule entry with ID ${lecture_id} not found`, 404);
      }
      return await AttendanceRecordModel.upsertByLectureId(lecture_id, statusVal);
    }

    throw new AppError('Either id or lecture_id must be provided to update attendance', 400);
  },

  /**
   * Delete attendance record by ID
   * @param {number|string} id - Attendance record ID
   * @returns {Promise<boolean>} True if successfully deleted
   * @throws {AppError} 404 if attendance record not found
   */
  async deleteAttendance(id) {
    const existing = await AttendanceRecordModel.findById(id);
    if (!existing) {
      throw new AppError(`Attendance record with ID ${id} not found`, 404);
    }

    await AttendanceRecordModel.deleteById(id);
    return true;
  },
};
