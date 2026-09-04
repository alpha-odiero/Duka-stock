import { api } from '@/lib/api';
import type { Pagination, Product, StockMovement } from '@/types';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: 'low' | 'out' | 'in_stock';
  sort?: string;
}

export interface ProductListResult {
  products: Product[];
  pagination: Pagination;
}

export interface ProductCreateInput {
  name: string;
  categoryId?: string | null;
  supplierId?: string | null;
  sku?: string;
  barcode?: string;
  buyingPrice: number | string;
  sellingPrice: number | string;
  quantity?: number;
  lowStockThreshold?: number;
  unit?: string;
  imageUrl?: string;
  cloudinaryPublicId?: string | null;
  description?: string;
}

export interface ProductDetail extends Product {
  stockMovements: StockMovement[];
  saleItems: (import('@/types').SaleItem & { sale?: { receiptNumber: string; createdAt: string; paymentMethod: string } })[];
}

export const productService = {
  async list(query: ProductQuery = {}): Promise<ProductListResult> {
    const res = await api.get('/products', { params: query });
    return res.data.data;
  },
  async get(id: string): Promise<ProductDetail> {
    const res = await api.get(`/products/${id}`);
    return res.data.data.product;
  },
  async create(input: ProductCreateInput): Promise<Product> {
    const res = await api.post('/products', input);
    return res.data.data.product;
  },
  async update(id: string, input: Partial<ProductCreateInput>): Promise<Product> {
    const res = await api.patch(`/products/${id}`, input);
    return res.data.data.product;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
  async stockIn(id: string, quantity: number, reason?: string): Promise<Product> {
    const res = await api.post(`/products/${id}/stock/in`, { quantity, reason });
    return res.data.data.product;
  },
  async stockOut(
    id: string,
    quantity: number,
    type: 'DAMAGE' | 'EXPIRED' | 'LOST' | 'ADJUSTMENT',
    reason?: string,
  ): Promise<Product> {
    const res = await api.post(`/products/${id}/stock/out`, { quantity, type, reason });
    return res.data.data.product;
  },
  async movements(id: string, page = 1, limit = 30) {
    const res = await api.get(`/products/${id}/stock/movements`, { params: { page, limit } });
    return res.data.data;
  },
};
