import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Reusable hook for making API calls with consistent loading and error states.
 *
 * Returns:
 *  - data: response data (null until success)
 *  - loading: boolean, true while the request is in flight
 *  - error: string | null, a user-facing error message (guaranteed string)
 *  - execute: async function to call the API (pass an axios request config)
 *  - reset: clear data and error
 */
export default function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (request) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await api(request);
        setData(response.data);
        return response.data;
      } catch (err) {
        let message = 'An unexpected error occurred.';
        if (err.response?.data?.message && typeof err.response.data.message === 'string') {
          message = err.response.data.message;
        } else if (typeof err.response?.data === 'string' && err.response.data) {
          message = err.response.data;
        } else if (err.message && typeof err.message === 'string') {
          message = err.message;
        }
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
