import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

/**
 * Reusable hook for checking system connectivity status.
 *
 * Checks:
 *  - Frontend: always "success" when the hook is mounted (page is running)
 *  - Backend API: GET /api/health (verifies HTTP 200 + success: true)
 *  - Database: GET /api/database/status (verifies HTTP 200 + success: true)
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
    setFrontendStatus('success');
    setBackendStatus('loading');
    setDatabaseStatus('loading');

    const now = new Date().toISOString();

    // Backend API check
    try {
      const response = await api.get(ENDPOINTS.health);
      if (response && response.data && response.data.success === true) {
        setBackendStatus('success');
      } else {
        setBackendStatus('failure');
      }
    } catch {
      setBackendStatus('failure');
    }

    // Database check
    try {
      const response = await api.get(ENDPOINTS.databaseStatus);
      if (response && response.data && response.data.success === true) {
        setDatabaseStatus('success');
      } else {
        setDatabaseStatus('failure');
      }
    } catch {
      setDatabaseStatus('failure');
    }

    setLastChecked(now);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await checkConnectivity();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
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
