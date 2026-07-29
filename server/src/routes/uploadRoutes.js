import { Router } from 'express';
import { uploadCalendar, uploadTimetable } from '../controllers/uploadController.js';
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
