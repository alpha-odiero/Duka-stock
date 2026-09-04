import { api } from '@/lib/api';
import type {
  Order,
  PaymentMethod,
  PublicCategory,
  PublicOffer,
  PublicProduct,
  PublicStorefrontConfig,
  StoreInfo,
} from '@/types';

export interface StoreProductResult {
  products: PublicProduct[];
}

export interface StoreProductDetailResult {
  shop: StoreInfo;
  product: PublicProduct;
}

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutItemInput[];
  paymentMethod: PaymentMethod;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  deliveryAddress?: string;
  notes?: string;
}

function withShop(params: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) if (v && v.trim()) out[k] = v;
  return out;
}

export const storeService = {
  async getShop(shopName?: string): Promise<StoreInfo> {
    const res = await api.get('/store/shop', { params: withShop({ shop: shopName }) });
    return res.data.data.shop;
  },
  async listProducts(opts: { shop?: string; category?: string; search?: string; limit?: number } = {}): Promise<
    PublicProduct[]
  > {
    const params = withShop({
      shop: opts.shop,
      category: opts.category,
      search: opts.search,
      limit: opts.limit ? String(opts.limit) : undefined,
    });
    const res = await api.get('/store/products', { params });
    return res.data.data.products;
  },
  async getProduct(slug: string, shopName?: string): Promise<StoreProductDetailResult> {
    const res = await api.get(`/store/products/${slug}`, { params: withShop({ shop: shopName }) });
    return res.data.data;
  },
  async listCategories(shopName?: string): Promise<PublicCategory[]> {
    const res = await api.get('/store/categories', { params: withShop({ shop: shopName }) });
    return res.data.data.categories;
  },
  // Curated ~80 product homepage selection.
  async listCurated(shopName?: string): Promise<PublicProduct[]> {
    const res = await api.get('/store/products', { params: withShop({ shop: shopName, curated: 'true' }) });
    return res.data.data.products;
  },
  // Active offers & promotions surfaced on the storefront.
  async listOffers(shopName?: string): Promise<PublicOffer[]> {
    const res = await api.get('/store/offers', { params: withShop({ shop: shopName }) });
    return res.data.data.offers;
  },
  async getConfig(shopName?: string): Promise<PublicStorefrontConfig> {
    const res = await api.get('/store/config', { params: withShop({ shop: shopName }) });
    return res.data.data;
  },
  async checkout(input: CheckoutInput, shopName?: string): Promise<Order> {
    const res = await api.post('/store/checkout', input, { params: withShop({ shop: shopName }) });
    return res.data.data.order;
  },
};
