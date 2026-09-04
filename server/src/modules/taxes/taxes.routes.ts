import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { PERMISSIONS, respondIfHasAnyPermission } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { taxRateCreateSchema, taxRateUpdateSchema } from './taxes.schema';
import { createTaxRate, deleteTaxRate, getTaxRate, listTaxRates, updateTaxRate } from './taxes.service';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', respondIfHasAnyPermission(PERMISSIONS.TAX_VIEW, PERMISSIONS.SETTINGS_VIEW), async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const taxes = await listTaxRates(req.user!.shop!.id, includeInactive);
    return ok(res, { taxes });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', respondIfHasAnyPermission(PERMISSIONS.TAX_VIEW, PERMISSIONS.SETTINGS_VIEW), async (req, res, next) => {
  try {
    const tax = await getTaxRate(req.user!.shop!.id, req.params.id);
    return ok(res, { tax });
  } catch (error) {
    next(error);
  }
});

router.post('/', respondIfHasAnyPermission(PERMISSIONS.TAX_MANAGE, PERMISSIONS.SETTINGS_EDIT), validate(taxRateCreateSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      name: string;
      rate: number | string;
      type: 'INCLUSIVE' | 'EXCLUSIVE';
      category: 'TAXABLE' | 'TAX_EXEMPT' | 'ZERO_RATED' | 'STANDARD';
      isActive?: boolean;
      isDefault?: boolean;
    };
    const tax = await createTaxRate(req.user!.shop!.id, body);
    await auditLog({ action: 'TAX_RATE_CREATED', entityType: 'TaxRate', entityId: tax.id, metadata: { name: tax.name, rate: String(tax.rate) }, req });
    return created(res, { tax });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', respondIfHasAnyPermission(PERMISSIONS.TAX_MANAGE, PERMISSIONS.SETTINGS_EDIT), validate(taxRateUpdateSchema), async (req, res, next) => {
  try {
    const tax = await updateTaxRate(req.user!.shop!.id, req.params.id, req.body as never);
    await auditLog({ action: 'TAX_RATE_UPDATED', entityType: 'TaxRate', entityId: tax.id, req });
    return ok(res, { tax });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', respondIfHasAnyPermission(PERMISSIONS.TAX_MANAGE, PERMISSIONS.SETTINGS_EDIT), async (req, res, next) => {
  try {
    await deleteTaxRate(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'TAX_RATE_DELETED', entityType: 'TaxRate', entityId: req.params.id, req });
    return ok(res, { success: true });
  } catch (error) {
    next(error);
  }
});

export default router;