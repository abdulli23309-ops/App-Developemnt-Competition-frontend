import axios from 'axios';

// Normalize API base URL so /api is present exactly once
let rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
rawBase = rawBase.replace(/\/+$/, '');

// Ensure /api suffix exists on baseURL exactly once if a host/URL is provided
let normalizedBaseUrl = rawBase;
if (normalizedBaseUrl && !normalizedBaseUrl.endsWith('/api')) {
  normalizedBaseUrl = `${normalizedBaseUrl}/api`;
}

if (!normalizedBaseUrl && typeof window !== 'undefined') {
  console.info(
    'VITE_API_BASE_URL is not set. API requests will be dispatched relative to current host with /api prefix.',
  );
  normalizedBaseUrl = '/api';
}

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Attach timestamp header, Bearer token, and prevent double /api/api prefix
api.interceptors.request.use((config) => {
  config.headers['X-Request-Time'] = new Date().toISOString();

  // Strip duplicate /api if both baseURL ends with /api and config.url starts with /api
  if (config.url && config.baseURL?.endsWith('/api') && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }

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

      // Centralized 403 Forbidden handler
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
            errorMessage:
              error.response.data?.message ||
              'Access Denied: You do not have permission to access this resource.',
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
