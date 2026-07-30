import { Router } from 'express';
import { getTodaySchedule, generateSchedule } from '../controllers/scheduleController.js';

const router = Router();

/**
 * @route   GET /api/schedule/today
 * @desc    Get automatic daily schedule engine response (working day status, holiday reason, chronological lectures)
 * @access  Public
 */
router.get('/today', getTodaySchedule);

/**
 * @route   POST /api/schedule/generate
 * @desc    Generate semester schedule in MySQL database
 * @access  Public
 */
router.post('/generate', generateSchedule);

export default router;
