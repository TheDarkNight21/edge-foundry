import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};

export const usePolling = (apiCall, interval = 30000) => {
  const { data, loading, error, fetchData } = useApi();

  useEffect(() => {
    const poll = () => {
      fetchData(apiCall);
    };

    // Initial fetch
    poll();

    // Set up polling
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }, [apiCall, interval, fetchData]);

  return { data, loading, error };
};