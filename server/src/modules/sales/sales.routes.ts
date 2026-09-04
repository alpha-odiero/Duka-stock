import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { notifyStockLevel } from '../../utils/notifications';
import { createSaleSchema, saleQuerySchema } from './sales.schema';
import { createSale, getSale, listSales } from './sales.service';
import { invalidateAfterSale } from '../../services/cache/invalidation.service';

const router = Router();
router.use(requireAuth, requireShop);

router.get('/', validate(saleQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listSales(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.SALES_CREATE), validate(createSaleSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      items: { productId: string; quantity: number; variantId?: string | null; batchId?: string | null }[];
      paymentMethod: 'CASH' | 'MPESA' | 'CARD' | 'BANK' | 'CREDIT' | 'OTHER';
      payments?: { method: 'CASH' | 'MPESA' | 'CARD' | 'BANK' | 'CREDIT' | 'OTHER'; amount: number | string; reference?: string | null }[];
      source?: 'POS' | 'ONLINE';
      customerId?: string | null;
      discount?: number | string | null;
      discountPercent?: number | null;
      paymentReference?: string | null;
      amountPaid?: number | string | null;
      registerId?: string | null;
    };
    const { sale, productUpdates } = await createSale(
      req.user!.shop!.id,
      body.items,
      body.paymentMethod,
      req.user!.id,
      {
        source: body.source,
        customerId: body.customerId ?? null,
        discount: body.discount ?? 0,
        discountPercent: body.discountPercent ?? undefined,
        paymentReference: body.paymentReference ?? null,
        amountPaid: body.amountPaid ?? null,
        registerId: body.registerId ?? req.user!.register?.id ?? null,
        payments: body.payments ?? undefined,
      },
    );
    await auditLog({
      action: 'SALE_CREATED',
      entityType: 'Sale',
      entityId: sale.id,
      metadata: { total: String(sale.totalAmount), paymentMethod: sale.paymentMethod, paymentStatus: sale.paymentStatus, receipt: sale.receiptNumber, source: sale.source, paymentCount: sale.payments?.length ?? 1 },
      req,
    });
    // Low-stock alerts after a successful commit.
    for (const u of productUpdates) {
      await notifyStockLevel(req.user!.shop!.id, u.name, u.id, u.newQty, u.threshold);
    }
    // Invalidate dashboard/reports/storefront + affected product caches after
    // the sale commits, so cached reads reflect the new stock and revenue.
    await invalidateAfterSale(
      req.user!.shop!.id,
      productUpdates.map((u) => u.id),
    );
    return created(res, { sale });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const sale = await getSale(req.user!.shop!.id, req.params.id);
    return ok(res, { sale });
  } catch (error) {
    next(error);
  }
});

export default router;
