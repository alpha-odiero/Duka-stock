import { api } from '@/lib/api';
import type { Shop } from '@/types';

export interface ShopUpdateInput {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  businessPin?: string;
  website?: string;
  logo?: string;
  currency?: string;
  timezone?: string;
  registerName?: string;
  receiptFooter?: string;
}

export const shopService = {
  async get(): Promise<Shop> {
    const res = await api.get('/shop');
    return res.data.data.shop;
  },
  async update(input: ShopUpdateInput): Promise<Shop> {
    const res = await api.patch('/shop', input);
    return res.data.data.shop;
  },
};
