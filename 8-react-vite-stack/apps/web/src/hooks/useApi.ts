import { useCallback } from 'react';
import { apiFetch } from '@/lib/api.js';
import { useAppAuth } from '@/auth/app-auth-context.js';

export function useApi() {
  const { getToken } = useAppAuth();
  return useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      const token = await getToken();
      return apiFetch<T>(path, { ...init, token });
    },
    [getToken]
  );
}
