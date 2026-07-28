import { AttendanceService } from '../services/attendanceService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Controller handlers for Attendance REST endpoints
 */

/**
 * @desc    Get today's attendance records
 * @route   GET /api/attendance/today
 * @access  Public
 */
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const records = await AttendanceService.getTodayAttendance();
  res.status(200).json({
    status: 'success',
    results: records.length,
    data: records,
  });
});

/**
 * @desc    Get historical attendance records
 * @route   GET /api/attendance/history
 * @access  Public
 */
export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const filters = {
    subject_id: req.query.subject_id,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    attendance_status: req.query.attendance_status || req.query.status,
  };
  const records = await AttendanceService.getAttendanceHistory(filters);
  res.status(200).json({
    status: 'success',
    results: records.length,
    data: records,
  });
});

/**
 * @desc    Mark attendance for a lecture (creates new record)
 * @route   POST /api/attendance/mark
 * @access  Public
 */
export const markAttendance = asyncHandler(async (req, res) => {
  const newRecord = await AttendanceService.markAttendance(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Attendance marked successfully',
    data: newRecord,
  });
});

/**
 * @desc    Update an existing attendance record
 * @route   PUT /api/attendance/update
 * @access  Public
 */
export const updateAttendance = asyncHandler(async (req, res) => {
  const updatedRecord = await AttendanceService.updateAttendance(req.body);
  res.status(200).json({
    status: 'success',
    message: 'Attendance record updated successfully',
    data: updatedRecord,
  });
});

/**
 * @desc    Delete an attendance record by ID
 * @route   DELETE /api/attendance/:id
 * @access  Public
 */
export const deleteAttendance = asyncHandler(async (req, res) => {
  await AttendanceService.deleteAttendance(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Attendance record deleted successfully',
  });
});
