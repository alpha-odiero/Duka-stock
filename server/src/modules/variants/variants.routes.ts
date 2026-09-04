import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { PERMISSIONS, respondIfHasAnyPermission } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { variantCreateSchema, variantQuerySchema, variantUpdateSchema } from './variants.schema';
import {
  adjustVariantStock,
  createVariant,
  deleteVariant,
  getVariant,
  listVariants,
  updateVariant,
} from './variants.service';
import { z } from 'zod';

const router = Router();
router.use(requireAuth, requireShop);

const stockAdjustSchema = z.object({
  newQuantity: z.number().int().min(0, 'Quantity must be zero or more'),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
});

router.get('/', validate(variantQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listVariants(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', respondIfHasAnyPermission(PERMISSIONS.VARIANT_VIEW, PERMISSIONS.PRODUCTS_VIEW), async (req, res, next) => {
  try {
    const variant = await getVariant(req.user!.shop!.id, req.params.id);
    return ok(res, { variant });
  } catch (error) {
    next(error);
  }
});

router.post('/', respondIfHasAnyPermission(PERMISSIONS.VARIANT_MANAGE, PERMISSIONS.PRODUCTS_CREATE), validate(variantCreateSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      productId: string;
      name: string;
      sku?: string | null;
      barcode?: string | null;
      buyingPrice: number | string;
      sellingPrice: number | string;
      quantity?: number;
      lowStockThreshold?: number;
      imageUrl?: string | null;
      isActive?: boolean;
    };
    const variant = await createVariant(
      req.user!.shop!.id,
      body.productId,
      {
        name: body.name,
        sku: body.sku ?? null,
        barcode: body.barcode ?? null,
        buyingPrice: body.buyingPrice,
        sellingPrice: body.sellingPrice,
        quantity: body.quantity ?? 0,
        lowStockThreshold: body.lowStockThreshold,
        imageUrl: body.imageUrl ?? null,
        isActive: body.isActive,
      },
      req.user!.id,
    );
    await auditLog({ action: 'VARIANT_CREATED', entityType: 'ProductVariant', entityId: variant.id, metadata: { productId: body.productId, name: variant.name }, req });
    return created(res, { variant });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', respondIfHasAnyPermission(PERMISSIONS.VARIANT_MANAGE, PERMISSIONS.PRODUCTS_EDIT), validate(variantUpdateSchema), async (req, res, next) => {
  try {
    const variant = await updateVariant(req.user!.shop!.id, req.params.id, req.body as never);
    await auditLog({ action: 'VARIANT_UPDATED', entityType: 'ProductVariant', entityId: variant.id, req });
    return ok(res, { variant });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/stock', respondIfHasAnyPermission(PERMISSIONS.VARIANT_MANAGE, PERMISSIONS.INVENTORY_ADJUST), validate(stockAdjustSchema), async (req, res, next) => {
  try {
    const body = req.body as { newQuantity: number; reason?: string };
    const updated = await adjustVariantStock(req.user!.shop!.id, req.params.id, body.newQuantity, body.reason, req.user!.id);
    await auditLog({ action: 'VARIANT_STOCK_ADJUSTED', entityType: 'ProductVariant', entityId: req.params.id, metadata: { newQuantity: body.newQuantity }, req });
    return ok(res, { updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', respondIfHasAnyPermission(PERMISSIONS.VARIANT_MANAGE, PERMISSIONS.PRODUCTS_DELETE), async (req, res, next) => {
  try {
    await deleteVariant(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'VARIANT_DELETED', entityType: 'ProductVariant', entityId: req.params.id, req });
    return ok(res, { success: true });
  } catch (error) {
    next(error);
  }
});

export default router;