/**
 * Centralized API endpoint definitions for CampusConnect.
 *
 * Keep all backend route paths here so they can be updated in one place.
 * Base URL is configured in client.js via VITE_API_BASE_URL.
 */

export const ENDPOINTS = {
  // System Health & Connectivity
  health: '/health',
  databaseStatus: '/database/status',

  // Authentication & Profile
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    demoUsers: '/auth/demo-users',
  },

  // Categories & Departments
  categories: '/categories',
  departments: '/departments',

  // Complaints Management
  complaints: {
    list: '/complaints',
    detail: (id) => `/complaints/${id}`,
    create: '/complaints',
    updateStatus: (id) => `/complaints/${id}/status`,
    addRemark: (id) => `/complaints/${id}/remarks`,
    submitRating: (id) => `/complaints/${id}/rating`,
    reopen: (id) => `/complaints/${id}/reopen`,
    exportCsv: '/complaints/export/csv',
  },

  // Analytics & Reports
  analytics: {
    summary: '/analytics/summary',
    byDepartment: '/analytics/by-department',
    trend: '/analytics/trend',
    resolutionTime: '/analytics/resolution-time',
    topIssues: '/analytics/top-issues',
  },

  // Notifications & Alerts
  notifications: {
    list: '/notifications',
    markRead: (id) => `/notifications/${id}/read`,
  },
};

export default ENDPOINTS;
