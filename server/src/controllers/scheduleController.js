import { AIScheduleService } from '../services/aiScheduleService.js';
import { DailyScheduleService } from '../services/dailyScheduleService.js';
import { getTempCalendar, getTempTimetable } from '../services/tempStoreService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Controller to handle full semester schedule generation
 * POST /upload/generate-schedule (or POST /api/schedule/generate)
 */
export const generateSchedule = async (req, res, next) => {
  try {
    let { calendar, timetable, calendarAnalysisId, timetableAnalysisId, overwrite } = req.body;

    // If analysis IDs were passed, retrieve staged data from temporary store
    if (!calendar && calendarAnalysisId) {
      const stagedCal = getTempCalendar(calendarAnalysisId);
      if (stagedCal) {
        calendar = stagedCal.calendarData;
      }
    }

    if (!timetable && timetableAnalysisId) {
      const stagedTt = getTempTimetable(timetableAnalysisId);
      if (stagedTt) {
        timetable = stagedTt.timetableData?.timetable || stagedTt.timetableData;
      }
    }

    if (!calendar || !timetable) {
      return res.status(400).json({
        status: 'fail',
        message: 'Both Academic Calendar and Weekly Timetable data are required to generate schedule.'
      });
    }

    const result = await AIScheduleService.generateCompleteSemesterSchedule({
      calendar,
      timetable,
      overwrite: Boolean(overwrite)
    });

    return res.status(201).json({
      status: 'success',
      message: result.message,
      data: result.statistics
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_SEMESTER_SCHEDULE') {
      return res.status(409).json({
        status: 'fail',
        code: 'DUPLICATE_SEMESTER_SCHEDULE',
        message: error.message,
        duplicateCount: error.duplicateCount
      });
    }
    next(error);
  }
};

/**
 * Controller to fetch today's or target date's daily schedule
 * GET /api/schedule/today
 */
export const getTodaySchedule = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || null;
  const scheduleData = await DailyScheduleService.getDailySchedule(targetDate);
  res.status(200).json({
    status: 'success',
    data: scheduleData
  });
});
