import { api } from '@/lib/api';
import type { Pagination, PaymentMethod, Sale, SaleSource } from '@/types';

export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export interface CreateSaleInput {
  items: SaleItemInput[];
  paymentMethod: PaymentMethod;
  source?: SaleSource;
  customerId?: string | null;
  discount?: number | string;
  discountPercent?: number;
  paymentReference?: string | null;
  amountPaid?: number | string | null;
  registerId?: string | null;
}

export interface SaleListParams {
  page?: number;
  limit?: number;
  paymentMethod?: PaymentMethod;
  source?: SaleSource;
  period?: string;
  from?: string;
  to?: string;
}

export interface SaleListResult {
  sales: Sale[];
  pagination: Pagination;
}

export const saleService = {
  async list(params: SaleListParams = {}): Promise<SaleListResult> {
    const res = await api.get('/sales', { params });
    return res.data.data;
  },
  async get(id: string): Promise<Sale> {
    const res = await api.get(`/sales/${id}`);
    return res.data.data.sale;
  },
  async create(input: CreateSaleInput): Promise<Sale> {
    const res = await api.post('/sales', input);
    return res.data.data.sale;
  },
};
