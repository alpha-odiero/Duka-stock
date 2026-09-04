import { api } from '@/lib/api';
import type { DashboardData } from '@/types';

export const dashboardService = {
  async get(range: '7' | '30' | '90' | 'custom' = '7', from?: string, to?: string): Promise<DashboardData> {
    const res = await api.get('/dashboard', {
      params: { range, ...(from ? { from } : {}), ...(to ? { to } : {}) },
    });
    return res.data.data;
  },
};
