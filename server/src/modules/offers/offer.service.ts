import type { Offer, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export type OfferStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'DISABLED';

// Computes the effective status of an offer from its dates — the source of
// truth. Never trusts a stored status alone; SCHEDULED/ACTIVE/EXPIRED derive
// from startDate/endDate so offers expire automatically.
export function effectiveOfferStatus(
  offer: Pick<Offer, 'status' | 'startDate' | 'endDate' | 'visible'>,
): OfferStatus {
  if (offer.status === 'DISABLED') return 'DISABLED';
  if (!offer.visible) return 'DISABLED';
  const now = new Date();
  const start = offer.startDate ? new Date(offer.startDate) : null;
  const end = offer.endDate ? new Date(offer.endDate) : null;

  if (end && now > end) return 'EXPIRED';
  if (start && now < start) return 'SCHEDULED';

  // Within the active window (or no dates set): ACTIVE unless explicitly disabled.
  return 'ACTIVE';
}

// Bulk-update stored status for expired offers so dashboard listing reflects
// reality even if nobody touches them. Called on offer queries and a startup
// sweep. Adds an index-friendly status + date query.
export async function expireOffersForShop(shopId: string): Promise<void> {
  const now = new Date();
  await prisma.offer.updateMany({
    where: { shopId, status: { in: ['ACTIVE', 'SCHEDULED'] }, endDate: { lt: now } },
    data: { status: 'EXPIRED' },
  });
}

// Resolves the best applicable offer for a given product id as of "now".
// Returns the effective discount (as a computed price or amount) alongside the
// offer, or null if no active/visible offer applies. Only used for display;
// checkout re-derives and validates server-side.
export async function resolveProductOffer(shopId: string, productId: string) {
  await expireOffersForShop(shopId);
  const now = new Date();

  const offers = await prisma.offer.findMany({
    where: {
      shopId,
      visible: true,
      status: { in: ['ACTIVE', 'SCHEDULED'] },
      OR: [
        { startDate: null, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
      products: { some: { productId } },
    },
    include: { products: { select: { productId: true } }, categories: { select: { categoryId: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  if (offers.length === 0) return null;
  return offers[0];
}

// Public projection of an offer for the storefront. Only safe marketing data.
export function publicOffer(offer: {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  discountType: Offer['discountType'];
  discountValue: Prisma.Decimal | string | number;
  minimumPurchase: Prisma.Decimal | string | number | null;
  maximumDiscount: Prisma.Decimal | string | number | null;
  promoCode: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: Offer['status'];
  visible: boolean;
}) {
  const status = effectiveOfferStatus(offer);
  return {
    id: offer.id,
    name: offer.name,
    description: offer.description,
    imageUrl: offer.imageUrl,
    discountType: offer.discountType,
    discountValue: offer.discountValue.toString(),
    minimumPurchase: offer.minimumPurchase?.toString() ?? null,
    maximumDiscount: offer.maximumDiscount?.toString() ?? null,
    promoCode: offer.promoCode,
    status,
    startDate: offer.startDate ? offer.startDate.toISOString() : null,
    endDate: offer.endDate ? offer.endDate.toISOString() : null,
  };
}
