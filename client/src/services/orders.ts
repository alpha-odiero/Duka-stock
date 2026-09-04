import { api } from '@/lib/api';
import type { Order, OrderStatus, Pagination, PaymentMethod, SaleSource } from '@/types';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  paymentMethod: PaymentMethod;
  source?: SaleSource;
  customerId?: string | null;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  deliveryAddress?: string;
  notes?: string;
  discount?: number | string;
  discountPercent?: number;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  source?: SaleSource;
  from?: string;
  to?: string;
  search?: string;
}

export interface OrderListResult {
  orders: Order[];
  pagination: Pagination;
}

export const orderService = {
  async list(params: OrderListParams = {}): Promise<OrderListResult> {
    const res = await api.get('/orders', { params });
    return res.data.data;
  },
  async get(id: string): Promise<Order> {
    const res = await api.get(`/orders/${id}`);
    return res.data.data.order;
  },
  async create(input: CreateOrderInput): Promise<Order> {
    const res = await api.post('/orders', input);
    return res.data.data.order;
  },
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data.data.order;
  },
};
