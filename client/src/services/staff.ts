import { api } from '@/lib/api';
import type { Pagination, Register, User, UserRole, UserStatus } from '@/types';

export interface StaffListParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export interface StaffListResult {
  staff: User[];
  pagination: Pagination;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone?: string;
  userName?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  status?: UserStatus;
  registerId?: string | null;
  avatar?: string | null;
}

export interface UpdateStaffInput {
  fullName?: string;
  phone?: string;
  userName?: string;
  role?: UserRole;
  status?: UserStatus;
  registerId?: string | null;
  avatar?: string | null;
}

export interface StaffPerformance {
  staff: { id: string; fullName: string; role: UserRole; status: UserStatus; register?: Register | null };
  todaySales: number;
  transactions: number;
  todayTransactions: number;
  averageTransaction: number;
  totalSales: number;
  refunds: number;
  voided: number;
}

export interface StaffSalesResult {
  sales: import('@/types').Sale[];
  pagination: Pagination;
}

export interface StaffActivityResult {
  activity: { id: string; action: string; entityType?: string | null; entityId?: string | null; metadata?: unknown; ipAddress?: string | null; userAgent?: string | null; createdAt: string }[];
  pagination: Pagination;
}

export const staffService = {
  async list(params: StaffListParams = {}): Promise<StaffListResult> {
    const res = await api.get('/staff', { params });
    return res.data.data;
  },
  async get(id: string): Promise<User> {
    const res = await api.get(`/staff/${id}`);
    return res.data.data.staff;
  },
  async create(input: CreateStaffInput): Promise<User> {
    const res = await api.post('/staff', input);
    return res.data.data.staff;
  },
  async update(id: string, input: UpdateStaffInput): Promise<User> {
    const res = await api.patch(`/staff/${id}`, input);
    return res.data.data.staff;
  },
  async resetPassword(id: string, newPassword: string, confirmPassword: string): Promise<void> {
    await api.post(`/staff/${id}/password`, { newPassword, confirmPassword });
  },
  async deactivate(id: string): Promise<User> {
    const res = await api.post(`/staff/${id}/deactivate`);
    return res.data.data.staff;
  },
  async reactivate(id: string): Promise<User> {
    const res = await api.post(`/staff/${id}/reactivate`);
    return res.data.data.staff;
  },
  async performance(id: string): Promise<StaffPerformance> {
    const res = await api.get(`/staff/${id}/performance`);
    return res.data.data;
  },
  async sales(id: string, params: { page?: number; limit?: number; status?: string } = {}): Promise<StaffSalesResult> {
    const res = await api.get(`/staff/${id}/sales`, { params });
    return res.data.data;
  },
  async activity(id: string, params: { page?: number; limit?: number } = {}): Promise<StaffActivityResult> {
    const res = await api.get(`/staff/${id}/activity`, { params });
    return res.data.data;
  },
};
