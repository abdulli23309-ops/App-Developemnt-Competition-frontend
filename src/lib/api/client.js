import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

if (!API_BASE_URL && typeof window !== 'undefined') {
  console.info(
    'VITE_API_BASE_URL is not set. API requests will be dispatched relative to current host.',
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach a request timestamp header and optional Bearer token if present
api.interceptors.request.use((config) => {
  config.headers['X-Request-Time'] = new Date().toISOString();
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Centralized response error handling.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API error ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );

      // Section 10: Centralized 403 Forbidden handler
      if (error.response.status === 403 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/403') {
          // Extract attempted complaint ID or URL if available
          const match = error.config?.url?.match(/\/complaints\/(\d+)/);
          const attemptedComplaintId = match ? match[1] : null;

          const context = {
            attemptedPath: currentPath,
            attemptedUrl: error.config?.url,
            attemptedComplaintId,
            errorMessage: error.response.data?.message || 'Access Denied: You do not have permission to access this resource.',
            timestamp: new Date().toISOString(),
          };

          try {
            sessionStorage.setItem('cc_403_context', JSON.stringify(context));
          } catch (e) {
            // ignore storage quota error
          }

          // Trigger navigation to /403
          window.location.assign('/403');
        }
      }
    } else if (error.request) {
      console.error(
        `API network error ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );
    } else {
      console.error('API request setup error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
export { api };
