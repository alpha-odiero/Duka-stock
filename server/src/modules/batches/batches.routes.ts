import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { PERMISSIONS, respondIfHasAnyPermission } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { adjustBatchSchema, batchQuerySchema, bulkCreateBatchSchema } from './batches.schema';
import {
  adjustBatch,
  createBatch,
  deleteBatch,
  discardBatch,
  getBatch,
  listBatches,
  refreshExpiringStatuses,
} from './batches.service';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', respondIfHasAnyPermission(PERMISSIONS.BATCH_VIEW, PERMISSIONS.INVENTORY_VIEW), validate(batchQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listBatches(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

// Recomputes ACTIVE/EXPIRING_SOON/EXPIRED labels. Cheap; safe to hit often.
router.post('/refresh-status', respondIfHasAnyPermission(PERMISSIONS.BATCH_VIEW, PERMISSIONS.INVENTORY_VIEW), async (req, res, next) => {
  try {
    const result = await refreshExpiringStatuses(req.user!.shop!.id);
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', respondIfHasAnyPermission(PERMISSIONS.BATCH_VIEW, PERMISSIONS.INVENTORY_VIEW), async (req, res, next) => {
  try {
    const batch = await getBatch(req.user!.shop!.id, req.params.id);
    return ok(res, { batch });
  } catch (error) {
    next(error);
  }
});

router.post('/', respondIfHasAnyPermission(PERMISSIONS.BATCH_MANAGE, PERMISSIONS.INVENTORY_RECEIVE), validate(bulkCreateBatchSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      productId: string;
      variantId?: string | null;
      batchNumber: string;
      supplierId?: string | null;
      purchaseId?: string | null;
      manufacturingDate?: string | null;
      expiryDate: string;
      quantity: number;
      costPerUnit: number | string;
    };
    const batch = await createBatch(
      req.user!.shop!.id,
      {
        productId: body.productId,
        variantId: body.variantId ?? null,
        batchNumber: body.batchNumber,
        supplierId: body.supplierId ?? null,
        purchaseId: body.purchaseId ?? null,
        manufacturingDate: body.manufacturingDate ?? null,
        expiryDate: body.expiryDate,
        quantity: body.quantity,
        costPerUnit: body.costPerUnit,
      },
      req.user!.id,
    );
    await auditLog({ action: 'BATCH_CREATED', entityType: 'Batch', entityId: batch.id, metadata: { batchNumber: batch.batchNumber, productId: body.productId }, req });
    return created(res, { batch });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/stock', respondIfHasAnyPermission(PERMISSIONS.BATCH_MANAGE, PERMISSIONS.INVENTORY_ADJUST), validate(adjustBatchSchema), async (req, res, next) => {
  try {
    const body = req.body as { newQuantity: number; reason?: string };
    const updated = await adjustBatch(req.user!.shop!.id, req.params.id, body.newQuantity, body.reason, req.user!.id);
    await auditLog({ action: 'BATCH_STOCK_ADJUSTED', entityType: 'Batch', entityId: req.params.id, metadata: { newQuantity: body.newQuantity }, req });
    return ok(res, { updated });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/discard', respondIfHasAnyPermission(PERMISSIONS.BATCH_MANAGE, PERMISSIONS.INVENTORY_WRITEOFF), async (req, res, next) => {
  try {
    const reason = (req.body as { reason?: string } | undefined)?.reason;
    const batch = await discardBatch(req.user!.shop!.id, req.params.id, req.user!.id, reason);
    await auditLog({ action: 'BATCH_DISCARDED', entityType: 'Batch', entityId: req.params.id, metadata: { batchNumber: batch.batchNumber }, req });
    return ok(res, { batch });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', respondIfHasAnyPermission(PERMISSIONS.BATCH_MANAGE, PERMISSIONS.INVENTORY_DELETE_MOVEMENT), async (req, res, next) => {
  try {
    await deleteBatch(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'BATCH_DELETED', entityType: 'Batch', entityId: req.params.id, req });
    return ok(res, { success: true });
  } catch (error) {
    next(error);
  }
});

export default router;