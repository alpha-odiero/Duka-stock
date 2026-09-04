import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { NotFoundError } from '../../lib/errors';
import { auditLog } from '../../utils/audit';
import { expenseCreateSchema, expenseQuerySchema, expenseUpdateSchema } from './expenses.schema';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(expenseQuerySchema, 'query'), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const { page, limit, category, from, to } = req.query as {
      page?: number;
      limit?: number;
      category?: string;
      from?: string;
      to?: string;
    };
    const skip = ((page ?? 1) - 1) * (limit ?? 20);

    const where: Record<string, unknown> = { shopId };
    if (category) where.category = category;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.gte = new Date(from as string);
      if (to) {
        const t = new Date(to as string);
        t.setHours(23, 59, 59, 999);
        range.lte = t;
      }
      where.expenseDate = range;
    }

    const [total, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({ where, orderBy: { expenseDate: 'desc' }, skip, take: limit ?? 20 }),
    ]);

    return ok(res, { expenses, pagination: { page: page ?? 1, limit: limit ?? 20, total, totalPages: Math.ceil(total / (limit ?? 20)) } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('OWNER', 'ADMIN'), validate(expenseCreateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const expense = await prisma.expense.create({
      data: {
        shopId,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
        expenseDate: req.body.expenseDate ? new Date(req.body.expenseDate) : new Date(),
        createdBy: req.user!.id ?? null,
      },
    });
    await auditLog({ action: 'EXPENSE_CREATED', entityType: 'Expense', entityId: expense.id, req });
    return created(res, { expense });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('OWNER', 'ADMIN'), validate(expenseUpdateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.expense.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Expense not found');
    const data: Record<string, unknown> = { ...req.body };
    if (data.expenseDate) data.expenseDate = new Date(data.expenseDate as string);
    const expense = await prisma.expense.update({ where: { id: req.params.id }, data });
    await auditLog({ action: 'EXPENSE_UPDATED', entityType: 'Expense', entityId: expense.id, req });
    return ok(res, { expense });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.expense.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Expense not found');
    await prisma.expense.delete({ where: { id: req.params.id } });
    await auditLog({ action: 'EXPENSE_DELETED', entityType: 'Expense', entityId: req.params.id, req });
    return ok(res, { message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
