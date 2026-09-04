import { api } from '@/lib/api';
import type { Pagination, Purchase } from '@/types';

export interface PurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number | string;
}

export interface CreatePurchaseInput {
  supplierId?: string | null;
  purchaseDate?: string;
  notes?: string;
  items: PurchaseItemInput[];
}

export const purchaseService = {
  async list(params: {
    page?: number;
    limit?: number;
    supplierId?: string;
    from?: string;
    to?: string;
  } = {}): Promise<{ purchases: Purchase[]; pagination: Pagination }> {
    const res = await api.get('/purchases', { params });
    return res.data.data;
  },
  async get(id: string): Promise<Purchase> {
    const res = await api.get(`/purchases/${id}`);
    return res.data.data.purchase;
  },
  async create(input: CreatePurchaseInput): Promise<Purchase> {
    const res = await api.post('/purchases', input);
    return res.data.data.purchase;
  },
};
