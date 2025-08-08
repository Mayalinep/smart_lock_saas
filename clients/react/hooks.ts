import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

export const api = axios.create({ baseURL: 'http://localhost:3000/api', withCredentials: true });

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      await api.post('/auth/login', payload);
    }
  });
}

export function useMyAccesses(params: { limit?: number; cursor?: string | null }) {
  const { limit = 20, cursor = null } = params;
  return useQuery({
    queryKey: ['my-accesses', limit, cursor],
    queryFn: async () => {
      const { data } = await api.get('/access/my-accesses', { params: { limit, cursor } });
      return data as { items: any[]; nextCursor: string | null; hasMore: boolean };
    }
  });
}

export function useLockStatus(propertyId: string) {
  return useQuery({
    queryKey: ['lock-status', propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/lock/status/${propertyId}`);
      return data as { propertyId: string; status: string; lastActivity: string; batteryLevel: number };
    },
    enabled: Boolean(propertyId)
  });
}

