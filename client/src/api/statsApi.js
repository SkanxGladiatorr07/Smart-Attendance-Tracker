import api from './axiosInstance';

export const getSubjectStats = async () => {
  const response = await api.get('/stats/subjects');
  return response.data;
};

export const getOverallStats = async () => {
  const response = await api.get('/stats/overall');
  return response.data;
};

export const getLiveStats = async () => {
  const response = await api.get('/stats/live');
  return response.data;
};
