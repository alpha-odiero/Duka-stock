import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { ok } from '../../lib/responses';
import { requireAuth } from '../../middleware/auth';
import { authorize, requireShop } from '../../middleware/authorize';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { shopUpdateSchema } from './shops.schema';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.user!.shop!.id },
      include: { _count: { select: { products: true, sales: true, suppliers: true } } },
    });
    return ok(res, { shop });
  } catch (error) {
    next(error);
  }
});

router.patch('/', authorize('OWNER', 'ADMIN'), requirePermission(PERMISSIONS.SETTINGS_EDIT), validate(shopUpdateSchema), async (req, res, next) => {
  try {
    const shop = await prisma.shop.update({
      where: { id: req.user!.shop!.id },
      data: req.body,
    });
    await auditLog({ action: 'SHOP_UPDATED', entityType: 'Shop', entityId: shop.id, req });
    return ok(res, { shop });
  } catch (error) {
    next(error);
  }
});

export default router;
