import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute: renders children only when authenticated.
 * If !token || !user, immediately navigates to /login with replace.
 */
export default function ProtectedRoute({ children }) {
  const { token, user, isLoading } = useAuth();

  // While auth state is still being restored, render nothing to avoid flashes
  if (isLoading) return null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}