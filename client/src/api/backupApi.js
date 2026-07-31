import api from './axiosInstance';

export const exportBackupApi = async () => {
  const response = await api.get('/backup/export', { responseType: 'blob' });
  return response;
};

export const importBackupApi = async (backupPayload, overwrite = false) => {
  const response = await api.post('/backup/import', backupPayload, {
    params: { overwrite },
  });
  return response.data;
};
