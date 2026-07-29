import { Router } from 'express';
import { uploadCalendar, uploadTimetable } from '../controllers/uploadController.js';
import { 
  analyzeCalendar, 
  getTempCalendarById, 
  confirmCalendar 
} from '../controllers/calendarAiController.js';
import { 
  analyzeTimetable, 
  getTempTimetableById, 
  confirmTimetable 
} from '../controllers/timetableAiController.js';
import { generateSchedule } from '../controllers/scheduleController.js';
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

/**
 * @route   POST /upload/timetable/analyze
 * @desc    Upload & Analyze Weekly Timetable with AI Vision Model
 * @access  Public
 */
router.post(
  '/timetable/analyze',
  createSingleUploadMiddleware(['timetable', 'file']),
  analyzeTimetable
);

/**
 * @route   GET /upload/timetable/temp/:analysisId
 * @desc    Get staged temporary timetable analysis by ID
 * @access  Public
 */
router.get('/timetable/temp/:analysisId', getTempTimetableById);

/**
 * @route   POST /upload/timetable/confirm
 * @desc    Confirm staged timetable data after user review
 * @access  Public
 */
router.post('/timetable/confirm', confirmTimetable);

/**
 * @route   POST /upload/generate-schedule
 * @desc    Generate full semester schedule in MySQL database
 * @access  Public
 */
router.post('/generate-schedule', generateSchedule);

export default router;
