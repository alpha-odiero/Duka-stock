import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { NotFoundError } from '../../lib/errors';
import { auditLog } from '../../utils/audit';
import { offerCreateSchema, offerQuerySchema, offerUpdateSchema } from './offer.schema';
import { effectiveOfferStatus, expireOffersForShop } from './offer.service';

const router = Router();
router.use(requireAuth, requireShop);

// List offers, deriving effective status. Runs the expiry sweep so expired
// offers reflect reality without manual admin intervention.
router.get('/', requirePermission(PERMISSIONS.OFFERS_VIEW), validate(offerQuerySchema, 'query'), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    await expireOffersForShop(shopId);
    const { page = 1, limit = 20, status } = req.query as { page?: number; limit?: number; status?: string };

    const where: Record<string, unknown> = { shopId };
    if (status) where.status = status;

    const [total, offers] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { products: true, categories: true } },
        },
      }),
    ]);

    return ok(res, { offers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requirePermission(PERMISSIONS.OFFERS_VIEW), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id, shopId },
      include: { products: true, categories: true },
    });
    if (!offer) throw new NotFoundError('Offer not found');
    return ok(res, { offer });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.OFFERS_MANAGE), validate(offerCreateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const { productIds, categoryIds, ...rest } = req.body;

    const offer = await prisma.offer.create({
      data: {
        shopId,
        name: rest.name,
        description: rest.description ?? null,
        imageUrl: rest.imageUrl ?? null,
        imagePublicId: rest.imagePublicId ?? null,
        discountType: rest.discountType,
        discountValue: rest.discountValue,
        startDate: rest.startDate ?? null,
        endDate: rest.endDate ?? null,
        minimumPurchase: rest.minimumPurchase ?? null,
        maximumDiscount: rest.maximumDiscount ?? null,
        promoCode: rest.promoCode ?? null,
        status: rest.status ?? 'DRAFT',
        visible: rest.visible ?? true,
        products: productIds?.length ? { create: productIds.map((productId: string) => ({ productId })) } : undefined,
        categories: categoryIds?.length
          ? { create: categoryIds.map((categoryId: string) => ({ categoryId })) }
          : undefined,
      },
    });

    // Derive the effective status from dates for the response.
    const effective = effectiveOfferStatus({ ...offer, status: rest.status ?? 'DRAFT' });
    await auditLog({ action: 'OFFER_CREATED', entityType: 'Offer', entityId: offer.id, req });
    return created(res, { offer: { ...offer, effectiveStatus: effective } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermission(PERMISSIONS.OFFERS_MANAGE), validate(offerUpdateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.offer.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Offer not found');

    const { productIds, categoryIds, ...rest } = req.body;

    const offer = await prisma.$transaction(async (tx) => {
      const data: Record<string, unknown> = {};
      if (rest.name !== undefined) data.name = rest.name;
      if (rest.description !== undefined) data.description = rest.description;
      if (rest.imageUrl !== undefined) data.imageUrl = rest.imageUrl;
      if (rest.imagePublicId !== undefined) data.imagePublicId = rest.imagePublicId;
      if (rest.discountType !== undefined) data.discountType = rest.discountType;
      if (rest.discountValue !== undefined) data.discountValue = rest.discountValue;
      if (rest.startDate !== undefined) data.startDate = rest.startDate ?? null;
      if (rest.endDate !== undefined) data.endDate = rest.endDate ?? null;
      if (rest.minimumPurchase !== undefined) data.minimumPurchase = rest.minimumPurchase ?? null;
      if (rest.maximumDiscount !== undefined) data.maximumDiscount = rest.maximumDiscount ?? null;
      if (rest.promoCode !== undefined) data.promoCode = rest.promoCode ?? null;
      if (rest.status !== undefined) data.status = rest.status;
      if (rest.visible !== undefined) data.visible = rest.visible;

      if (productIds !== undefined) {
        await tx.offerProduct.deleteMany({ where: { offerId: existing.id } });
        data.products = productIds.length ? { create: productIds.map((productId: string) => ({ productId })) } : undefined;
      }
      if (categoryIds !== undefined) {
        await tx.offerCategory.deleteMany({ where: { offerId: existing.id } });
        data.categories = categoryIds.length
          ? { create: categoryIds.map((categoryId: string) => ({ categoryId })) }
          : undefined;
      }

      return tx.offer.update({ where: { id: existing.id }, data });
    });

    const effective = effectiveOfferStatus({ ...offer, status: rest.status ?? existing.status });
    await auditLog({ action: 'OFFER_UPDATED', entityType: 'Offer', entityId: offer.id, req });
    return ok(res, { offer: { ...offer, effectiveStatus: effective } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission(PERMISSIONS.OFFERS_MANAGE), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.offer.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Offer not found');
    await prisma.offer.delete({ where: { id: existing.id } });
    await auditLog({ action: 'OFFER_DELETED', entityType: 'Offer', entityId: existing.id, req });
    return ok(res, { message: 'Offer deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
