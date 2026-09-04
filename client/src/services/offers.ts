import { api } from '@/lib/api';
import type { Offer, DiscountType, OfferStatus } from '@/types';

export interface OfferInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  discountType: DiscountType;
  discountValue: number;
  startDate?: string | null;
  endDate?: string | null;
  minimumPurchase?: number | null;
  maximumDiscount?: number | null;
  promoCode?: string | null;
  status?: OfferStatus;
  visible?: boolean;
  productIds?: string[];
  categoryIds?: string[];
}

export const offerService = {
  async list(params: { page?: number; limit?: number; status?: OfferStatus; search?: string } = {}): Promise<{
    offers: Offer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await api.get('/offers', { params });
    const { offers, pagination } = res.data.data;
    return { offers, total: pagination?.total ?? 0, page: pagination?.page ?? 1, limit: pagination?.limit ?? 20 };
  },
  async get(id: string): Promise<Offer> {
    const res = await api.get(`/offers/${id}`);
    return res.data.data.offer;
  },
  async create(input: OfferInput): Promise<Offer> {
    const res = await api.post('/offers', input);
    return res.data.data.offer;
  },
  async update(id: string, input: Partial<OfferInput>): Promise<Offer> {
    const res = await api.patch(`/offers/${id}`, input);
    return res.data.data.offer;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/offers/${id}`);
  },
};
