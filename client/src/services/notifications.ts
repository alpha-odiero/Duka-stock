import { api } from '@/lib/api';
import type { Notification } from '@/types';

export const notificationService = {
  async list(): Promise<{ notifications: Notification[]; unread: number; total: number }> {
    const res = await api.get('/notifications');
    return res.data.data;
  },
  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
