import api from './axiosInstance';

export const getTodayAttendance = async (date) => {
  const response = await api.get('/attendance/today', { params: date ? { date } : {} });
  return response.data;
};

export const getAttendanceHistory = async (params = {}) => {
  const response = await api.get('/attendance/history', { params });
  return response.data;
};

export const markAttendance = async (attendanceData) => {
  const response = await api.post('/attendance/mark', attendanceData);
  return response.data;
};

export const updateAttendance = async (attendanceData) => {
  const response = await api.put('/attendance/update', attendanceData);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};
