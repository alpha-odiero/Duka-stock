import { api } from '@/lib/api';
import type { Supplier } from '@/types';

export interface SupplierInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const supplierService = {
  async list(): Promise<Supplier[]> {
    const res = await api.get('/suppliers');
    return res.data.data.suppliers;
  },
  async get(id: string): Promise<Supplier> {
    const res = await api.get(`/suppliers/${id}`);
    return res.data.data.supplier;
  },
  async create(input: SupplierInput): Promise<Supplier> {
    const res = await api.post('/suppliers', input);
    return res.data.data.supplier;
  },
  async update(id: string, input: Partial<SupplierInput>): Promise<Supplier> {
    const res = await api.patch(`/suppliers/${id}`, input);
    return res.data.data.supplier;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};
