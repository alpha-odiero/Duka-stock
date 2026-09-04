import { api } from '@/lib/api';
import type { Pagination, Refund, RefundMethod, ReturnCondition, SalesReturn } from '@/types';

export interface CreateReturnItemInput {
  saleItemId: string;
  quantity: number;
  condition?: ReturnCondition;
}

export interface CreateReturnInput {
  saleId: string;
  items: CreateReturnItemInput[];
  refundMethod?: RefundMethod;
  registerId?: string | null;
  notes?: string;
}

export interface CreateReturnResult {
  return: SalesReturn;
  requiresApproval: boolean;
  outcome: { fullyRefunded: boolean } | null;
}

export interface ReturnListParams {
  page?: number;
  limit?: number;
  status?: SalesReturn['status'];
}

export interface ReturnListResult {
  returns: SalesReturn[];
  pagination: Pagination;
}

export interface RefundListResult {
  refunds: Refund[];
  pagination: Pagination;
}

export const returnsService = {
  async list(params: ReturnListParams = {}): Promise<ReturnListResult> {
    const res = await api.get('/returns', { params });
    return res.data.data;
  },
  async get(id: string): Promise<SalesReturn> {
    const res = await api.get(`/returns/${id}`);
    return res.data.data.return;
  },
  async create(input: CreateReturnInput): Promise<CreateReturnResult> {
    const res = await api.post('/returns', input);
    return res.data.data;
  },
  async approve(id: string, approved: boolean, notes?: string): Promise<{ return: SalesReturn; outcome: { fullyRefunded: boolean } | null }> {
    const res = await api.post(`/returns/${id}/approve`, { approved, notes: notes ?? undefined });
    return res.data.data;
  },
  async refunds(params: { page?: number; limit?: number } = {}): Promise<RefundListResult> {
    const res = await api.get('/returns/refunds', { params });
    return res.data.data;
  },
};