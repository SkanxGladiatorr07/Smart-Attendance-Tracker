import api from './axiosInstance';

/**
 * Upload Academic Calendar document to POST /api/upload/calendar
 * @param {File} file 
 * @param {Function} onUploadProgress 
 */
export const uploadCalendarApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('calendar', file);

  const response = await api.post('/upload/calendar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Upload & Analyze Academic Calendar with AI Vision Model
 * POST /api/upload/calendar/analyze
 * @param {File} file 
 * @param {Function} onUploadProgress 
 */
export const analyzeCalendarApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('calendar', file);

  const response = await api.post('/upload/calendar/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Get staged temporary calendar analysis by ID
 * GET /api/upload/calendar/temp/:analysisId
 * @param {string} analysisId 
 */
export const getTempCalendarApi = async (analysisId) => {
  const response = await api.get(`/upload/calendar/temp/${analysisId}`);
  return response.data;
};

/**
 * Confirm staged calendar data after user review
 * POST /api/upload/calendar/confirm
 * @param {string} analysisId 
 * @param {Object} [calendarData] Optional user edited calendar data
 */
export const confirmCalendarApi = async (analysisId, calendarData = null) => {
  const response = await api.post('/upload/calendar/confirm', {
    analysisId,
    calendarData
  });
  return response.data;
};

/**
 * Upload Weekly Timetable document to POST /api/upload/timetable
 * @param {File} file 
 * @param {Function} onUploadProgress 
 */
export const uploadTimetableApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('timetable', file);

  const response = await api.post('/upload/timetable', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Upload & Analyze Weekly Timetable with AI Vision Model
 * POST /api/upload/timetable/analyze
 * @param {File} file 
 * @param {Function} onUploadProgress 
 */
export const analyzeTimetableApi = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('timetable', file);

  const response = await api.post('/upload/timetable/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Get staged temporary timetable analysis by ID
 * GET /api/upload/timetable/temp/:analysisId
 * @param {string} analysisId 
 */
export const getTempTimetableApi = async (analysisId) => {
  const response = await api.get(`/upload/timetable/temp/${analysisId}`);
  return response.data;
};

/**
 * Confirm staged timetable data after user review
 * POST /api/upload/timetable/confirm
 * @param {string} analysisId 
 * @param {Object} [timetableData] Optional user edited timetable data
 */
export const confirmTimetableApi = async (analysisId, timetableData = null) => {
  const response = await api.post('/upload/timetable/confirm', {
    analysisId,
    timetableData
  });
  return response.data;
};

/**
 * Generate complete semester schedule in MySQL database
 * POST /api/upload/generate-schedule
 * @param {Object} payload - { calendar, timetable, calendarAnalysisId, timetableAnalysisId }
 */
export const generateScheduleApi = async (payload) => {
  const response = await api.post('/upload/generate-schedule', payload);
  return response.data;
};
