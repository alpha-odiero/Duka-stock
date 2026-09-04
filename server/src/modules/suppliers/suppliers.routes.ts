import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { NotFoundError } from '../../lib/errors';
import { auditLog } from '../../utils/audit';
import { supplierCreateSchema, supplierUpdateSchema } from './suppliers.schema';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const suppliers = await prisma.supplier.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true, purchases: true } } },
    });
    return ok(res, { suppliers });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('OWNER', 'ADMIN'), validate(supplierCreateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const supplier = await prisma.supplier.create({ data: { shopId, ...req.body } });
    await auditLog({ action: 'SUPPLIER_CREATED', entityType: 'Supplier', entityId: supplier.id, req });
    return created(res, { supplier });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const supplier = await prisma.supplier.findFirst({
      where: { id: req.params.id, shopId },
      include: {
        products: { select: { id: true, name: true, quantity: true, buyingPrice: true, lowStockThreshold: true } },
        purchases: { orderBy: { purchaseDate: 'desc' }, take: 50 },
      },
    });
    if (!supplier) throw new NotFoundError('Supplier not found');
    return ok(res, { supplier });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('OWNER', 'ADMIN'), validate(supplierUpdateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.supplier.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Supplier not found');
    const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
    await auditLog({ action: 'SUPPLIER_UPDATED', entityType: 'Supplier', entityId: supplier.id, req });
    return ok(res, { supplier });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.supplier.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Supplier not found');
    await prisma.supplier.delete({ where: { id: req.params.id } });
    await auditLog({ action: 'SUPPLIER_DELETED', entityType: 'Supplier', entityId: req.params.id, req });
    return ok(res, { message: 'Supplier deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
