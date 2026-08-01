import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor for automatic retry on network failure or 5xx server errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry setup: max 3 attempts for idempotent or network errors
    if (config && !config._retryCount) {
      config._retryCount = 0;
    }

    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    const isRateLimit = error.response && error.response.status === 429;

    if (config && config._retryCount < 3 && (isNetworkError || isServerError || isRateLimit)) {
      config._retryCount += 1;
      const delayMs = Math.pow(2, config._retryCount) * 1000;

      console.warn(
        `[API Retry] Attempt ${config._retryCount}/3 failed for ${config.url}. Retrying in ${delayMs}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return api(config);
    }

    // Meaningful Human-Readable Error Formatting
    if (isNetworkError) {
      error.message = 'Unable to connect to AttendAI server. Please check your internet connection or backend server status.';
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.status === 404) {
      error.message = 'Requested resource or API endpoint not found.';
    } else if (error.response?.status === 500) {
      error.message = 'An unexpected server error occurred. Please try again shortly.';
    }

    return Promise.reject(error);
  }
);

export default api;
