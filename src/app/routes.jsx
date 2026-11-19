import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import AccessDeniedPage from '../pages/AccessDeniedPage';
import SystemStatusPage from '../pages/SystemStatusPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import StudentDashboard from '../features/complaints/StudentDashboard';
import MyComplaintsPage from '../features/complaints/MyComplaintsPage';
import SubmitComplaintPage from '../features/complaints/SubmitComplaintPage';
import ComplaintDetailsPage from '../features/complaints/ComplaintDetailsPage';
import DeptAdminDashboard from '../features/admin/DeptAdminDashboard';
import SuperAdminDashboard from '../features/admin/SuperAdminDashboard';
import ComplaintQueuePage from '../features/admin/ComplaintQueuePage';
import NotificationsPage from '../features/notifications/NotificationsPage';
import { useAuth } from '../features/auth/AuthContext';
import ProtectedRoute from '../features/auth/ProtectedRoute';

// Root redirect: unauthenticated -> /login ; authenticated -> role dashboard
function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

// Route Guard for Admin Dashboard: routes DeptAdmin vs SuperAdmin
function RoleAdminDashboardRoute() {
  const { isSuperAdmin, isDeptAdmin, isStudent } = useAuth();
  if (isSuperAdmin) return <SuperAdminDashboard />;
  if (isDeptAdmin) return <DeptAdminDashboard />;
  if (isStudent) return <Navigate to="/" replace />;
  return <LoginPage />;
}

// Route Guard for Unified Complaints list
function UnifiedComplaintsRoute() {
  const { isStudent } = useAuth();
  if (isStudent) return <MyComplaintsPage />;
  return <ComplaintQueuePage />;
}

// Route Guard for Analytics
function RoleAnalyticsRoute() {
  const { isSuperAdmin, isDeptAdmin } = useAuth();
  if (isSuperAdmin) return <SuperAdminDashboard />;
  if (isDeptAdmin) return <DeptAdminDashboard />;
  return <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes — outside AppShell (no sidebar, no topbar) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected app shell (sidebar + topbar) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<RootRedirect />} />

        {/* Student Specific Routes */}
        <Route path="student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="student/new" element={<ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>} />
        <Route path="student/complaints" element={<ProtectedRoute><MyComplaintsPage /></ProtectedRoute>} />

        {/* Admin Specific Routes */}
        <Route path="admin/dashboard" element={<ProtectedRoute><RoleAdminDashboardRoute /></ProtectedRoute>} />
        <Route path="admin/complaints" element={<ProtectedRoute><ComplaintQueuePage /></ProtectedRoute>} />
        <Route path="admin/analytics" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />

        {/* Unified Grievance Routes */}
        <Route path="complaints" element={<ProtectedRoute><UnifiedComplaintsRoute /></ProtectedRoute>} />
        <Route path="complaints/new" element={<ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>} />
        <Route path="complaints/:id" element={<ProtectedRoute><ComplaintDetailsPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute><RoleAnalyticsRoute /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="alerts" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="system-status" element={<ProtectedRoute><SystemStatusPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="403" element={<AccessDeniedPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
