import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { createPurchaseSchema, purchaseQuerySchema } from './purchases.schema';
import { createPurchase, getPurchase, listPurchases } from './purchases.service';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(purchaseQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listPurchases(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('OWNER', 'ADMIN'), validate(createPurchaseSchema), async (req, res, next) => {
  try {
    const purchase = await createPurchase(req.user!.shop!.id, req.body, req.user!.id);
    await auditLog({
      action: 'PURCHASE_CREATED',
      entityType: 'Purchase',
      entityId: purchase.id,
      metadata: { total: String(purchase.totalAmount) },
      req,
    });
    return created(res, { purchase });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const purchase = await getPurchase(req.user!.shop!.id, req.params.id);
    return ok(res, { purchase });
  } catch (error) {
    next(error);
  }
});

export default router;
