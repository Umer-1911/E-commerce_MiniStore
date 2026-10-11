import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/healthService';
import { useAppStore } from '../store/useAppStore';

export function useHealth() {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setBackendConnected = useAppStore((state) => state.setBackendConnected);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setStatus(data.status);
      setBackendConnected(data.status === 'ok');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reach backend';
      setError(errorMessage);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [setBackendConnected]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { loading, status, error, refetch: fetchHealth };
}
