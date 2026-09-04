import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { customerCreateSchema, customerQuerySchema, customerUpdateSchema } from './customer.schema';
import { createCustomer, deleteCustomer, getCustomer, listCustomers, updateCustomer } from './customer.service';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(customerQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listCustomers(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.shop!.id, req.params.id);
    return ok(res, { customer });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('OWNER', 'ADMIN'), validate(customerCreateSchema), async (req, res, next) => {
  try {
    const customer = await createCustomer(req.user!.shop!.id, req.body);
    await auditLog({ action: 'CUSTOMER_CREATED', entityType: 'Customer', entityId: customer.id, req });
    return created(res, { customer });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('OWNER', 'ADMIN'), validate(customerUpdateSchema), async (req, res, next) => {
  try {
    const customer = await updateCustomer(req.user!.shop!.id, req.params.id, req.body);
    await auditLog({ action: 'CUSTOMER_UPDATED', entityType: 'Customer', entityId: customer.id, req });
    return ok(res, { customer });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    await deleteCustomer(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'CUSTOMER_DELETED', entityType: 'Customer', entityId: req.params.id, req });
    return ok(res, { message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
