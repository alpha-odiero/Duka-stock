import { Router } from 'express';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { dateRangeSchema, salesReportSchema } from './reports.schema';
import {
  inventoryReport,
  profitReport,
  purchaseReport,
  salesReport,
} from './reports.service';

const router = Router();
router.use(requireAuth, requireShop);
router.use(requirePermission(PERMISSIONS.REPORTS_VIEW));

router.get('/sales', validate(salesReportSchema, 'query'), async (req, res, next) => {
  try {
    const data = await salesReport(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/inventory', async (req, res, next) => {
  try {
    const data = await inventoryReport(req.user!.shop!.id);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/profit', validate(dateRangeSchema, 'query'), async (req, res, next) => {
  try {
    const data = await profitReport(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/purchases', validate(dateRangeSchema, 'query'), async (req, res, next) => {
  try {
    const data = await purchaseReport(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
