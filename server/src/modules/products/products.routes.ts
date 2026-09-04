import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { productCreateSchema, productQuerySchema, productUpdateSchema } from './products.schema';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from './products.service';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(productQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listProducts(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('OWNER', 'ADMIN'), validate(productCreateSchema), async (req, res, next) => {
  try {
    const product = await createProduct(req.user!.shop!.id, req.body, req.user!.id);
    await auditLog({ action: 'PRODUCT_CREATED', entityType: 'Product', entityId: product.id, req });
    return created(res, { product });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProduct(req.user!.shop!.id, req.params.id);
    return ok(res, { product });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('OWNER', 'ADMIN'), validate(productUpdateSchema), async (req, res, next) => {
  try {
    const product = await updateProduct(req.user!.shop!.id, req.params.id, req.body);
    await auditLog({ action: 'PRODUCT_UPDATED', entityType: 'Product', entityId: product.id, req });
    return ok(res, { product });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    await deleteProduct(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'PRODUCT_DELETED', entityType: 'Product', entityId: req.params.id, req });
    return ok(res, { message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
