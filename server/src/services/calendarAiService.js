import path from 'path';
import fs from 'fs';
import { extractAcademicCalendarWithAi } from './aiVisionService.js';
import { validateAiAcademicCalendar } from '../utils/aiValidationEngine.js';
import { 
  generateAnalysisId, 
  saveTempCalendar, 
  getTempCalendar, 
  removeTempCalendar 
} from './tempStoreService.js';

/**
 * Analyzes uploaded calendar document using AI Vision Model
 * @param {Object} file - Multer uploaded file object (or file metadata)
 * @returns {Promise<Object>} Staged analysis result
 */
export const processAndAnalyzeCalendar = async (file) => {
  if (!file || !file.path) {
    throw new Error('Valid file path is required for AI calendar analysis.');
  }

  const absoluteFilePath = path.resolve(file.path);
  if (!fs.existsSync(absoluteFilePath)) {
    throw new Error(`Uploaded file not found on disk at ${file.path}`);
  }

  // 1. Extract raw JSON via AI Vision
  const rawAiResult = await extractAcademicCalendarWithAi(absoluteFilePath, file.mimetype);

  // 2. Validate and sanitize extracted JSON with AI Validation Layer
  const validationResult = validateAiAcademicCalendar(rawAiResult);

  // 3. Generate unique Analysis ID
  const analysisId = generateAnalysisId();

  // 4. Save to temporary staging store (NOT database)
  const fileMetadata = {
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  };

  saveTempCalendar(analysisId, validationResult.sanitizedData || rawAiResult, fileMetadata);

  return {
    analysisId,
    status: 'staged',
    calendarData: validationResult.sanitizedData || rawAiResult,
    fileMetadata,
    validationErrors: validationResult.issues.map((i) => i.message),
    message: 'Academic Calendar parsed and staged in temporary store. Please review before confirmation.'
  };
};

/**
 * Retrieves staged calendar analysis by analysisId
 * @param {string} analysisId 
 */
export const fetchStagedCalendar = (analysisId) => {
  const entry = getTempCalendar(analysisId);
  if (!entry) {
    const error = new Error(`Staged calendar analysis "${analysisId}" not found or expired.`);
    error.statusCode = 404;
    throw error;
  }
  return entry;
};

/**
 * Confirms staged calendar data and prepares it for persistence
 * @param {string} analysisId 
 * @param {Object} [editedCalendarData] Optional user edits to calendar fields
 */
export const confirmAndPersistCalendar = async (analysisId, editedCalendarData = null) => {
  const stagedEntry = fetchStagedCalendar(analysisId);

  // Use user edited calendar data if provided, otherwise use staged data
  const finalCalendarData = editedCalendarData
    ? validateAiAcademicCalendar(editedCalendarData).sanitizedData || editedCalendarData
    : stagedEntry.calendarData;

  // Mark entry as confirmed in temp store (or remove after saving)
  removeTempCalendar(analysisId);

  return {
    status: 'confirmed',
    analysisId,
    calendarData: finalCalendarData,
    fileMetadata: stagedEntry.fileMetadata,
    confirmedAt: new Date().toISOString(),
    message: 'Academic Calendar successfully confirmed and saved.'
  };
};
