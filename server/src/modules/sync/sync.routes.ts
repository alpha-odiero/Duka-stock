import { Router } from 'express';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { receiveOperations, SyncOperation } from '../../services/sync/sync.service';

const router = Router();
router.use(requireAuth, requireShop);

// Endpoint that offline POS clients call to replay locally-captured operations
// (sales, stock adjustments) captured while offline. Each operation must carry a
// client-generated opId for idempotent replay — network retries are deduplicated
// by the queue and never apply the same mutation twice.
router.post('/sync', async (req, res, next) => {
  try {
    const ops = (req.body?.operations ?? []) as SyncOperation[];
    if (!Array.isArray(ops)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'operations must be an array' },
      });
    }
    const result = await receiveOperations(ops);
    return ok(res, { result });
  } catch (error) {
    next(error);
  }
});

export default router;
