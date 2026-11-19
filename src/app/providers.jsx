import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { AuthProvider } from '../features/auth/AuthContext';

/**
 * Top-level application providers wrapper.
 * Centralizes providers (Error Boundary, Router, Auth, Theme, etc.) in one clean hierarchy.
 */
export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
