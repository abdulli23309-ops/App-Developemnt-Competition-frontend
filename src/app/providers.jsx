import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { AuthProvider } from '../features/auth/AuthContext';
import { ToastProvider } from '../components/ui/ToastContext';

/**
 * Top-level application providers wrapper.
 * Centralizes providers (Error Boundary, Router, Auth, Toast) in one clean hierarchy.
 */
export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
