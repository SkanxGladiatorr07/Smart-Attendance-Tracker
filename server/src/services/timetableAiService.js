import path from 'path';
import fs from 'fs';
import { extractTimetableWithAi } from './aiVisionService.js';
import { validateTimetableJson } from '../utils/timetableValidator.js';
import { 
  generateTimetableAnalysisId, 
  saveTempTimetable, 
  getTempTimetable, 
  removeTempTimetable 
} from './tempStoreService.js';

/**
 * Analyzes uploaded weekly timetable document using AI Vision Model
 * @param {Object} file - Multer uploaded file object
 * @returns {Promise<Object>} Staged analysis result
 */
export const processAndAnalyzeTimetable = async (file) => {
  if (!file || !file.path) {
    throw new Error('Valid file path is required for AI timetable analysis.');
  }

  const absoluteFilePath = path.resolve(file.path);
  if (!fs.existsSync(absoluteFilePath)) {
    throw new Error(`Uploaded file not found on disk at ${file.path}`);
  }

  // 1. Extract raw JSON via AI Vision
  const rawAiResult = await extractTimetableWithAi(absoluteFilePath, file.mimetype);

  // 2. Validate and sanitize extracted JSON (Monday - Saturday schedule)
  const validationResult = validateTimetableJson(rawAiResult);

  // 3. Generate unique Analysis ID
  const analysisId = generateTimetableAnalysisId();

  // 4. Save to temporary staging store (NOT database)
  const fileMetadata = {
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  };

  saveTempTimetable(analysisId, validationResult.data, fileMetadata);

  return {
    analysisId,
    status: 'staged',
    timetableData: validationResult.data,
    fileMetadata,
    validationErrors: validationResult.errors,
    message: 'Weekly Timetable parsed and staged in temporary store. Please review before confirmation.'
  };
};

/**
 * Retrieves staged timetable analysis by analysisId
 * @param {string} analysisId 
 */
export const fetchStagedTimetable = (analysisId) => {
  const entry = getTempTimetable(analysisId);
  if (!entry) {
    const error = new Error(`Staged timetable analysis "${analysisId}" not found or expired.`);
    error.statusCode = 404;
    throw error;
  }
  return entry;
};

/**
 * Confirms staged timetable data and prepares it for persistence
 * @param {string} analysisId 
 * @param {Object} [editedTimetableData] Optional user edits to weekly schedule
 */
export const confirmAndPersistTimetable = async (analysisId, editedTimetableData = null) => {
  const stagedEntry = fetchStagedTimetable(analysisId);

  const finalTimetableData = editedTimetableData
    ? validateTimetableJson(editedTimetableData).data
    : stagedEntry.timetableData;

  removeTempTimetable(analysisId);

  return {
    status: 'confirmed',
    analysisId,
    timetableData: finalTimetableData,
    fileMetadata: stagedEntry.fileMetadata,
    confirmedAt: new Date().toISOString(),
    message: 'Weekly Timetable successfully confirmed and saved.'
  };
};
