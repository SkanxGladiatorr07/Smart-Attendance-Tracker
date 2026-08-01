/**
 * @file uploadApi.js
 * @module attendai/client/api/uploadApi
 * @description API functions for uploading and analyzing academic calendar and
 * weekly timetable documents via the AI Vision pipeline.
 *
 * Endpoints use multipart/form-data for file uploads and JSON for confirmation.
 */

import api from './axiosInstance';

/**
 * Builds a normalized upload progress handler for Axios.
 * @param {Function|undefined} onUploadProgress - Callback receiving percent (0–100)
 * @returns {Function} Axios `onUploadProgress` handler
 */
function buildProgressHandler(onUploadProgress) {
  return (progressEvent) => {
    if (onUploadProgress && progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percent);
    }
  };
}

// ─── Calendar ────────────────────────────────────────────────────────────────

/**
 * Upload Academic Calendar document.
 * @route POST /api/upload/calendar
 * @param {File} file
 * @param {Function} [onUploadProgress] - Progress callback receiving percent (0–100)
 * @returns {Promise<Object>}
 */
export const uploadCalendarApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('calendar', file);
  const response = await api.post('/upload/calendar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: buildProgressHandler(onUploadProgress),
  });
  return response.data;
};

/**
 * Upload & analyze Academic Calendar with the AI Vision model.
 * @route POST /api/upload/calendar/analyze
 * @param {File} file
 * @param {Function} [onUploadProgress]
 * @returns {Promise<Object>}
 */
export const analyzeCalendarApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('calendar', file);
  const response = await api.post('/upload/calendar/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: buildProgressHandler(onUploadProgress),
  });
  return response.data;
};

/**
 * Retrieve staged temporary calendar analysis by ID.
 * @route GET /api/upload/calendar/temp/:analysisId
 * @param {string} analysisId
 * @returns {Promise<Object>}
 */
export const getTempCalendarApi = async (analysisId) => {
  const response = await api.get(`/upload/calendar/temp/${analysisId}`);
  return response.data;
};

/**
 * Confirm staged calendar data into the database after user review.
 * @route POST /api/upload/calendar/confirm
 * @param {string} analysisId
 * @param {Object|null} [calendarData] - Optional user-edited calendar data
 * @returns {Promise<Object>}
 */
export const confirmCalendarApi = async (analysisId, calendarData = null) => {
  const response = await api.post('/upload/calendar/confirm', { analysisId, calendarData });
  return response.data;
};

// ─── Timetable ────────────────────────────────────────────────────────────────

/**
 * Upload Weekly Timetable document.
 * @route POST /api/upload/timetable
 * @param {File} file
 * @param {Function} [onUploadProgress]
 * @returns {Promise<Object>}
 */
export const uploadTimetableApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('timetable', file);
  const response = await api.post('/upload/timetable', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: buildProgressHandler(onUploadProgress),
  });
  return response.data;
};

/**
 * Upload & analyze Weekly Timetable with the AI Vision model.
 * @route POST /api/upload/timetable/analyze
 * @param {File} file
 * @param {Function} [onUploadProgress]
 * @returns {Promise<Object>}
 */
export const analyzeTimetableApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('timetable', file);
  const response = await api.post('/upload/timetable/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: buildProgressHandler(onUploadProgress),
  });
  return response.data;
};

/**
 * Retrieve staged temporary timetable analysis by ID.
 * @route GET /api/upload/timetable/temp/:analysisId
 * @param {string} analysisId
 * @returns {Promise<Object>}
 */
export const getTempTimetableApi = async (analysisId) => {
  const response = await api.get(`/upload/timetable/temp/${analysisId}`);
  return response.data;
};

/**
 * Confirm staged timetable data into the database after user review.
 * @route POST /api/upload/timetable/confirm
 * @param {string} analysisId
 * @param {Object|null} [timetableData] - Optional user-edited timetable data
 * @returns {Promise<Object>}
 */
export const confirmTimetableApi = async (analysisId, timetableData = null) => {
  const response = await api.post('/upload/timetable/confirm', { analysisId, timetableData });
  return response.data;
};

// ─── Schedule Generation ──────────────────────────────────────────────────────

/**
 * Generate a complete semester lecture schedule in the MySQL database
 * using confirmed calendar and timetable data.
 * @route POST /api/upload/generate-schedule
 * @param {Object} payload - { calendar, timetable, calendarAnalysisId, timetableAnalysisId }
 * @returns {Promise<Object>}
 */
export const generateScheduleApi = async (payload) => {
  const response = await api.post('/upload/generate-schedule', payload);
  return response.data;
};
