import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { UserContext } from '../lib/types';

export function useUserContext() {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserContext();
  }, []);

  async function fetchUserContext() {
    try {
      setLoading(true);
      const data = await apiClient.get<UserContext>('/me');
      setUserContext(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user context');
      setUserContext(null);
    } finally {
      setLoading(false);
    }
  }

  return { userContext, loading, error, refetch: fetchUserContext };
}
