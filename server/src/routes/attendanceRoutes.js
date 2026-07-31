import { Router } from 'express';
import {
  getTodayAttendance,
  getAttendanceHistory,
  getCalendarMonth,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';

const router = Router();

router.get('/today', getTodayAttendance);
router.get('/history', getAttendanceHistory);
router.get('/calendar-month', getCalendarMonth);
router.post('/mark', markAttendance);
router.put('/update', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;
