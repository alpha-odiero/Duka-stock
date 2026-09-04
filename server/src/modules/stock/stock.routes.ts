import { Router } from 'express';
import { z } from 'zod';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { stockInSchema, stockOutSchema } from './stock.schema';
import { addStock, listMovements, removeStock } from './stock.service';

const movementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

// Mounted under /products (mergeParams) so it shares the /:id product segment.
const router = Router({ mergeParams: true });
router.use(requireAuth, requireShop);

router.post('/:id/stock/in', authorize('OWNER', 'ADMIN'), validate(stockInSchema), async (req, res, next) => {
  try {
    const product = await addStock(req.user!.shop!.id, req.params.id, (req.body as { quantity: number; reason?: string }).quantity, (req.body as { reason?: string }).reason, req.user!.id);
    await auditLog({ action: 'STOCK_ADDED', entityType: 'Product', entityId: product.id, req });
    return ok(res, { product });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/stock/out', authorize('OWNER', 'ADMIN'), validate(stockOutSchema), async (req, res, next) => {
  try {
    const body = req.body as { quantity: number; type?: 'DAMAGE' | 'EXPIRED' | 'LOST' | 'ADJUSTMENT'; reason?: string };
    const product = await removeStock(
      req.user!.shop!.id,
      req.params.id,
      body.quantity,
      body.type ?? 'ADJUSTMENT',
      body.reason,
      req.user!.id,
    );
    await auditLog({ action: 'STOCK_REMOVED', entityType: 'Product', entityId: product.id, req });
    return ok(res, { product });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/stock/movements', validate(movementQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = req.query as unknown as { page: number; limit: number };
    const data = await listMovements(req.user!.shop!.id, req.params.id, query.page, query.limit);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
