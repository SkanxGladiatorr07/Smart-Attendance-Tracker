import { Router } from 'express';
import {
  getTodayAttendance,
  getAttendanceHistory,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';

const router = Router();

router.get('/today', getTodayAttendance);
router.get('/history', getAttendanceHistory);
router.post('/mark', markAttendance);
router.put('/update', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;
