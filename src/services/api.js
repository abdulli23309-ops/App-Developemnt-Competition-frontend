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

export default api;
