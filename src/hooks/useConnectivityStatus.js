import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

/**
 * Reusable hook for checking system connectivity status.
 *
 * Checks:
 *  - Frontend: always "success" when the hook is mounted (page is running)
 *  - Backend API: GET /api/health
 *  - Database: GET /api/database/status
 *
 * Returns an object with status objects for each system, a last-checked
 * timestamp, a checking flag, and a checkConnectivity() retry function.
 *
 * Status values: 'idle' | 'loading' | 'success' | 'failure'
 */
export default function useConnectivityStatus() {
  const [frontendStatus, setFrontendStatus] = useState('idle');
  const [backendStatus, setBackendStatus] = useState('idle');
  const [databaseStatus, setDatabaseStatus] = useState('idle');
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnectivity = useCallback(async () => {
    setIsChecking(true);
    const now = new Date().toISOString();

    // Frontend: the page is running, so it is always available.
    setFrontendStatus('success');

    // Backend API: actual HTTP request to /api/health.
    try {
      await api.get(ENDPOINTS.health);
      setBackendStatus('success');
    } catch {
      setBackendStatus('failure');
    }

    // Database: actual HTTP request to /api/database/status.
    try {
      await api.get(ENDPOINTS.databaseStatus);
      setDatabaseStatus('success');
    } catch {
      setDatabaseStatus('failure');
    }

    setLastChecked(now);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkConnectivity();
    };
    init();
  }, [checkConnectivity]);

  return {
    frontendStatus,
    backendStatus,
    databaseStatus,
    lastChecked,
    isChecking,
    checkConnectivity,
  };
}
