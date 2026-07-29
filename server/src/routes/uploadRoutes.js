import { Router } from 'express';
import { uploadCalendar, uploadTimetable } from '../controllers/uploadController.js';
import { 
  analyzeCalendar, 
  getTempCalendarById, 
  confirmCalendar 
} from '../controllers/calendarAiController.js';
import { createSingleUploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = Router();

/**
 * @route   POST /upload/calendar
 * @desc    Upload Academic Calendar document (PDF, PNG, JPG, JPEG)
 * @access  Public
 */
router.post(
  '/calendar',
  createSingleUploadMiddleware(['calendar', 'file']),
  uploadCalendar
);

/**
 * @route   POST /upload/calendar/analyze
 * @desc    Upload & Analyze Academic Calendar with AI Vision Model
 * @access  Public
 */
router.post(
  '/calendar/analyze',
  createSingleUploadMiddleware(['calendar', 'file']),
  analyzeCalendar
);

/**
 * @route   GET /upload/calendar/temp/:analysisId
 * @desc    Get staged temporary calendar analysis by ID
 * @access  Public
 */
router.get('/calendar/temp/:analysisId', getTempCalendarById);

/**
 * @route   POST /upload/calendar/confirm
 * @desc    Confirm staged calendar data after user review
 * @access  Public
 */
router.post('/calendar/confirm', confirmCalendar);

/**
 * @route   POST /upload/timetable
 * @desc    Upload Weekly Timetable document (PDF, PNG, JPG, JPEG)
 * @access  Public
 */
router.post(
  '/timetable',
  createSingleUploadMiddleware(['timetable', 'file']),
  uploadTimetable
);

export default router;
