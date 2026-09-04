import { api } from '@/lib/api';
import type { Customer, Pagination } from '@/types';

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface CustomerListItem extends Customer {
  _count?: { sales?: number; orders?: number };
}

export interface CustomerListResult {
  customers: CustomerListItem[];
  pagination: Pagination;
}

export interface CustomerInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export const customerService = {
  async list(params: CustomerListParams = {}): Promise<CustomerListResult> {
    const res = await api.get('/customers', { params });
    return res.data.data;
  },
  async get(id: string): Promise<CustomerListItem> {
    const res = await api.get(`/customers/${id}`);
    return res.data.data.customer;
  },
  async create(input: CustomerInput): Promise<Customer> {
    const res = await api.post('/customers', input);
    return res.data.data.customer;
  },
  async update(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    const res = await api.patch(`/customers/${id}`, input);
    return res.data.data.customer;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
