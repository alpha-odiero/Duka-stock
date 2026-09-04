import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { createOrderSchema, orderQuerySchema, updateOrderStatusSchema } from './order.schema';
import { createOrder, getOrder, listOrders, updateOrderStatus } from './order.service';
import type { CreateOrderInput } from './order.schema';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(orderQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listOrders(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(createOrderSchema), async (req, res, next) => {
  try {
    const body = req.body as CreateOrderInput;
    const { order } = await createOrder(req.user!.shop!.id, {
      items: body.items,
      paymentMethod: body.paymentMethod,
      source: body.source,
      customerId: body.customerId ?? null,
      customer: body.customer,
      deliveryAddress: body.deliveryAddress,
      notes: body.notes,
      discount: body.discount ?? 0,
      discountPercent: body.discountPercent ?? undefined,
      createdBy: req.user!.id,
    });
    await auditLog({ action: 'ORDER_CREATED', entityType: 'Order', entityId: order.id, req });
    return created(res, { order });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await getOrder(req.user!.shop!.id, req.params.id);
    return ok(res, { order });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', validate(updateOrderStatusSchema), async (req, res, next) => {
  try {
    const order = await updateOrderStatus(req.user!.shop!.id, req.params.id, req.body.status);
    await auditLog({
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'Order',
      entityId: order.id,
      metadata: { status: order.status },
      req,
    });
    return ok(res, { order });
  } catch (error) {
    next(error);
  }
});

export default router;
