import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach a request timestamp header to aid debugging. No authentication
// or token handling is implemented yet, per competition starter scope.
api.interceptors.request.use((config) => {
  config.headers['X-Request-Time'] = new Date().toISOString();
  return config;
});

// Centralized response error handling. Logs the error and re-throws so
// callers can still catch and present UI-specific messages. Never leaks
// connection strings, credentials, or internal server details.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The server responded with a status code outside the 2xx range.
      console.error(
        `API error ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );
    } else if (error.request) {
      // The request was made but no response was received (network error).
      console.error(
        `API network error ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );
    } else {
      // Something happened in setting up the request.
      console.error('API request setup error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default api;

