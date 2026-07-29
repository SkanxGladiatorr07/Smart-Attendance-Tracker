import { 
  processAndAnalyzeCalendar, 
  fetchStagedCalendar, 
  confirmAndPersistCalendar 
} from '../services/calendarAiService.js';

/**
 * Upload & Analyze Academic Calendar document using AI Vision Model
 * POST /upload/calendar/analyze (or POST /api/upload/calendar/analyze)
 */
export const analyzeCalendar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file provided. Please attach an Academic Calendar file (PDF, PNG, JPG, JPEG).'
      });
    }

    const result = await processAndAnalyzeCalendar(file);

    return res.status(201).json({
      status: 'success',
      message: result.message,
      data: {
        analysisId: result.analysisId,
        status: result.status,
        calendarData: result.calendarData,
        fileMetadata: result.fileMetadata,
        validationErrors: result.validationErrors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve staged temporary calendar data by analysisId
 * GET /upload/calendar/temp/:analysisId
 */
export const getTempCalendarById = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    if (!analysisId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Analysis ID is required.'
      });
    }

    const entry = fetchStagedCalendar(analysisId);

    return res.status(200).json({
      status: 'success',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm staged calendar data after user review
 * POST /upload/calendar/confirm
 */
export const confirmCalendar = async (req, res, next) => {
  try {
    const { analysisId, calendarData } = req.body;
    if (!analysisId) {
      return res.status(400).json({
        status: 'fail',
        message: 'analysisId is required to confirm calendar setup.'
      });
    }

    const confirmedResult = await confirmAndPersistCalendar(analysisId, calendarData);

    return res.status(200).json({
      status: 'success',
      message: confirmedResult.message,
      data: confirmedResult
    });
  } catch (error) {
    next(error);
  }
};
