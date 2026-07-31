import api from './axiosInstance';

export const getSubjectStats = async (target = 75) => {
  const response = await api.get('/stats/subjects', { params: { target } });
  return response.data;
};

export const getOverallStats = async (target = 75) => {
  const response = await api.get('/stats/overall', { params: { target } });
  return response.data;
};

export const getLiveStats = async (target = 75) => {
  const response = await api.get('/stats/live', { params: { target } });
  return response.data;
};

export const getPredictions = async (target = 75, subjectId = null) => {
  const params = { target };
  if (subjectId) params.subject_id = subjectId;
  const response = await api.get('/stats/predictions', { params });
  return response.data;
};

export const getSafeSkips = async (target = 75, subjectId = null) => {
  const params = { target };
  if (subjectId) params.subject_id = subjectId;
  const response = await api.get('/stats/safe-skips', { params });
  return response.data;
};

export const getRecommendations = async (target = 75) => {
  const response = await api.get('/stats/recommendations', { params: { target } });
  return response.data;
};

export const getSemesterProgress = async () => {
  const response = await api.get('/stats/semester-progress');
  return response.data;
};

export const getAnalyticsData = async () => {
  const response = await api.get('/stats/analytics');
  return response.data;
};
