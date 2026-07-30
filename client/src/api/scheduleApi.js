import api from './axiosInstance';

/**
 * Fetch today's or target date's daily schedule from Daily Schedule Engine
 * @param {string} [date] YYYY-MM-DD optional date
 */
export const getTodaySchedule = async (date) => {
  const params = date ? { date } : {};
  const response = await api.get('/schedule/today', { params });
  return response.data;
};
