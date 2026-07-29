import { 
  processAndAnalyzeTimetable, 
  fetchStagedTimetable, 
  confirmAndPersistTimetable 
} from '../services/timetableAiService.js';

/**
 * Upload & Analyze Weekly Timetable document using AI Vision Model
 * POST /upload/timetable/analyze (or POST /api/upload/timetable/analyze)
 */
export const analyzeTimetable = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file provided. Please attach a Weekly Timetable file (PDF, PNG, JPG, JPEG).'
      });
    }

    const result = await processAndAnalyzeTimetable(file);

    return res.status(201).json({
      status: 'success',
      message: result.message,
      data: {
        analysisId: result.analysisId,
        status: result.status,
        timetableData: result.timetableData,
        fileMetadata: result.fileMetadata,
        validationErrors: result.validationErrors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve staged temporary timetable data by analysisId
 * GET /upload/timetable/temp/:analysisId
 */
export const getTempTimetableById = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    if (!analysisId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Analysis ID is required.'
      });
    }

    const entry = fetchStagedTimetable(analysisId);

    return res.status(200).json({
      status: 'success',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm staged timetable data after user review
 * POST /upload/timetable/confirm
 */
export const confirmTimetable = async (req, res, next) => {
  try {
    const { analysisId, timetableData } = req.body;
    if (!analysisId) {
      return res.status(400).json({
        status: 'fail',
        message: 'analysisId is required to confirm timetable setup.'
      });
    }

    const confirmedResult = await confirmAndPersistTimetable(analysisId, timetableData);

    return res.status(200).json({
      status: 'success',
      message: confirmedResult.message,
      data: confirmedResult
    });
  } catch (error) {
    next(error);
  }
};
