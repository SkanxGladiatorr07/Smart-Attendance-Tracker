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
