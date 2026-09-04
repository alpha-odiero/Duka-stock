import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { validate } from '../../middleware/validate';
import { createOrderSchema } from '../orders/order.schema';
import {
  createPublicOrder,
  getPublicProduct,
  getPublicShopInfo,
  getPublicStorefrontConfig,
  listCuratedProducts,
  listPublicCategories,
  listPublicOffers,
  listPublicProducts,
} from './store.service';
import { storeProductsQuerySchema } from './store.schema';
import type { CreateOrderInput } from '../orders/order.schema';

// Public storefront API — no authentication required. Customers browse the
// catalog and place orders; the business app manages everything internally.
const router = Router();

router.get('/shop', async (req, res, next) => {
  try {
    const shop = await getPublicShopInfo((req.query.shop as string) || undefined);
    return ok(res, { shop });
  } catch (error) {
    next(error);
  }
});

router.get('/products', validate(storeProductsQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as { shop?: string; category?: string; search?: string; featured?: boolean; limit?: number; curated?: string };
    if (q.curated && q.curated !== 'false') {
      const products = await listCuratedProducts(q.shop || undefined, q.limit && q.limit > 0 ? q.limit : 80);
      return ok(res, { products });
    }
    const products = await listPublicProducts({
      shopName: q.shop || undefined,
      category: q.category || undefined,
      search: q.search || undefined,
      featured: q.featured,
      limit: q.limit,
    });
    return ok(res, { products });
  } catch (error) {
    next(error);
  }
});

router.get('/products/:slug', async (req, res, next) => {
  try {
    const shopName = (req.query.shop as string) || undefined;
    const detail = await getPublicProduct(req.params.slug, shopName);
    return ok(res, detail);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await listPublicCategories((req.query.shop as string) || undefined);
    return ok(res, { categories });
  } catch (error) {
    next(error);
  }
});

// Active offers & promotions surfaced on the storefront.
router.get('/offers', async (req, res, next) => {
  try {
    const offers = await listPublicOffers((req.query.shop as string) || undefined);
    return ok(res, { offers });
  } catch (error) {
    next(error);
  }
});

// Full public storefront configuration in a single call — hero, sections,
// featured, about, faqs, testimonials, contact, social, branding, nav, SEO and
// the shop record. Only intentionally-public marketing data is returned.
router.get('/config', async (req, res, next) => {
  try {
    const config = await getPublicStorefrontConfig((req.query.shop as string) || undefined);
    return ok(res, config);
  } catch (error) {
    next(error);
  }
});

router.post('/checkout', validate(createOrderSchema), async (req, res, next) => {
  try {
    const body = req.body as CreateOrderInput;
    const shopName = (req.query.shop as string) || undefined;
    const { order } = await createPublicOrder(shopName, {
      source: 'ONLINE',
      items: body.items,
      paymentMethod: body.paymentMethod,
      customer: body.customer,
      customerId: body.customerId ?? null,
      deliveryAddress: body.deliveryAddress,
      notes: body.notes,
      discount: body.discount ?? 0,
      discountPercent: body.discountPercent ?? undefined,
    });
    return created(res, { order });
  } catch (error) {
    next(error);
  }
});

export default router;
