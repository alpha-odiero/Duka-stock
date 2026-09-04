import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { NotFoundError } from '../../lib/errors';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const [total, unread, notifications] = await Promise.all([
      prisma.notification.count({ where: { shopId } }),
      prisma.notification.count({ where: { shopId, read: false } }),
      prisma.notification.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    return ok(res, { notifications, unread, total });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.notification.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Notification not found');
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    return ok(res, { notification });
  } catch (error) {
    next(error);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const result = await prisma.notification.updateMany({
      where: { shopId, read: false },
      data: { read: true },
    });
    return ok(res, { updated: result.count });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.notification.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Notification not found');
    await prisma.notification.delete({ where: { id: req.params.id } });
    return ok(res, { message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
