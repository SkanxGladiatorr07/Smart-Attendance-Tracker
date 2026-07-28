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
   */
  async getTodayAttendance() {
    return await AttendanceRecordModel.findTodayAttendance();
  },

  /**
   * Get historical attendance records with optional filtering
   * @param {Object} filters - Optional filters (subject_id, start_date, end_date, attendance_status)
   */
  async getAttendanceHistory(filters = {}) {
    return await AttendanceRecordModel.findAll(filters);
  },

  /**
   * Mark attendance for a scheduled lecture (creates new record)
   * Enforces strictly ONE attendance record per lecture.
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
