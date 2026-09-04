import { Router } from 'express';
import { z } from 'zod';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { getDashboard } from './dashboard.service';

const dashboardQuerySchema = z.object({
  range: z.enum(['7', '30', '90', 'custom']).default('7'),
  from: z.string().optional(),
  to: z.string().optional(),
});

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(dashboardQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await getDashboard(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
