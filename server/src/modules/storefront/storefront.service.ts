import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';
import { invalidateStorefront } from '../../services/cache/invalidation.service';

// Storefront is a 1:1 with shop. Every function resolves the shop owner's
// storefront through the authenticated shop id (never trust client ids).

export async function ensureStorefront(shopId: string) {
  const existing = await prisma.storefront.findUnique({ where: { shopId } });
  if (existing) return existing;
  return prisma.storefront.create({
    data: {
      shopId,
      storeName: undefined,
    },
  });
}

// Seed default sections + navigation for a brand new storefront so the public
// site has sensible defaults out of the box.
const DEFAULT_SECTIONS = [
  'hero', 'categories', 'featured', 'popular', 'new', 'stats', 'promo',
  'about', 'why', 'testimonials', 'faq', 'cta', 'newsletter',
];

const DEFAULT_NAV = [
  { label: 'Home', href: '/', isSystem: true },
  { label: 'Shop', href: '/shop', isSystem: true },
  { label: 'About', href: '/about', isSystem: false },
  { label: 'FAQ', href: '/faq', isSystem: false },
  { label: 'Contact', href: '/contact', isSystem: true },
];

export async function initializeStorefront(shopId: string) {
  const sf = await ensureStorefront(shopId);

  const sectionCount = await prisma.storefrontSection.count({ where: { storefrontId: sf.id } });
  if (sectionCount === 0) {
    await prisma.storefrontSection.createMany({
      data: DEFAULT_SECTIONS.map((section, i) => ({
        storefrontId: sf.id,
        section,
        enabled: section !== 'newsletter',
        sortOrder: i,
      })),
    });
  } else {
    // Backfill DefaultSections that predate the current set (e.g. `stats`) so
    // existing storefronts gain new homepage sections without resetting the
    // owner's existing toggles or ordering.
    const existing = await prisma.storefrontSection.findMany({
      where: { storefrontId: sf.id },
      select: { section: true, sortOrder: true },
    });
    const existingKeys = new Set(existing.map((s) => s.section));
    const missing = DEFAULT_SECTIONS.filter((section) => !existingKeys.has(section));
    if (missing.length > 0) {
      const maxOrder = existing.reduce((m, s) => Math.max(m, s.sortOrder), -1);
      await prisma.storefrontSection.createMany({
        data: missing.map((section, i) => ({
          storefrontId: sf.id,
          section,
          enabled: section !== 'newsletter',
          sortOrder: maxOrder + 1 + i,
        })),
      });
    }
  }

  const navCount = await prisma.storefrontNavItem.count({ where: { storefrontId: sf.id } });
  if (navCount === 0) {
    await prisma.storefrontNavItem.createMany({
      data: DEFAULT_NAV.map((n, i) => ({
        storefrontId: sf.id,
        label: n.label,
        href: n.href,
        sortOrder: i,
        enabled: true,
        isSystem: n.isSystem,
      })),
    });
  }

  await prisma.storefrontBranding.upsert({
    where: { storefrontId: sf.id },
    update: {},
    create: { storefrontId: sf.id },
  });
  await prisma.storefrontHero.upsert({ where: { storefrontId: sf.id }, update: {}, create: { storefrontId: sf.id } });
  await prisma.storefrontAbout.upsert({ where: { storefrontId: sf.id }, update: {}, create: { storefrontId: sf.id } });
  await prisma.storefrontContact.upsert({ where: { storefrontId: sf.id }, update: {}, create: { storefrontId: sf.id } });
  await prisma.storefrontSocial.upsert({ where: { storefrontId: sf.id }, update: {}, create: { storefrontId: sf.id } });
  await prisma.storefrontSeo.upsert({ where: { storefrontId: sf.id }, update: {}, create: { storefrontId: sf.id } });

  return sf;
}

// Bumps the top-level storefront record whenever a CMS sub-record changes. The
// public storefront resolves its default shop by "most recently touched"
// storefront (`Storefront.updatedAt`), so every hero/about/contact/faq/...
// edit makes that shop the one served at `/` and `/shop`. Reads never touch
// this, so browsing the storefront can never hijack the default.
export async function touchStorefront(shopId: string) {
  const result = await prisma.storefront.update({
    where: { shopId },
    data: { updatedAt: new Date() },
  });
  // CMS content drives the public storefront; invalidate its cache so edits
  // appear immediately.
  await invalidateStorefront(shopId);
  return result;
}

// ===== Main storefront record =====

export async function updateStorefront(shopId: string, input: Prisma.StorefrontUpdateInput) {
  await ensureStorefront(shopId);
  return prisma.storefront.update({ where: { shopId }, data: input });
}

export async function setStorefrontStatus(shopId: string, status: 'DRAFT' | 'PUBLISHED') {
  await ensureStorefront(shopId);
  return prisma.storefront.update({
    where: { shopId },
    data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : null },
  });
}

// ===== Hero =====

export async function getHero(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontHero.findUnique({ where: { storefrontId: sf.id } });
}

// Builds an upsert `create` payload from a validated update input, ignoring any
// id/system fields that would conflict with the storefront 1:1 link.
function createData<T>(sfId: string, input: unknown): T {
  const { id: _id, ...rest } = (input ?? {}) as Record<string, unknown>;
  return { storefrontId: sfId, ...rest } as T;
}

export async function updateHero(shopId: string, input: Prisma.StorefrontHeroUncheckedUpdateInput) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.storefrontHero.upsert({
    where: { storefrontId: sf.id },
    update: input,
    create: createData<Prisma.StorefrontHeroUncheckedCreateInput>(sf.id, input),
  });
  await touchStorefront(shopId);
  return result;
}

// ===== About =====

export async function getAbout(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontAbout.findUnique({ where: { storefrontId: sf.id } });
}

export async function updateAbout(shopId: string, input: Prisma.StorefrontAboutUncheckedUpdateInput) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.storefrontAbout.upsert({
    where: { storefrontId: sf.id },
    update: input,
    create: createData<Prisma.StorefrontAboutUncheckedCreateInput>(sf.id, input),
  });
  await touchStorefront(shopId);
  return result;
}

// ===== Contact =====

export async function getContact(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontContact.findUnique({ where: { storefrontId: sf.id } });
}

export async function updateContact(shopId: string, input: Prisma.StorefrontContactUncheckedUpdateInput) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.storefrontContact.upsert({
    where: { storefrontId: sf.id },
    update: input,
    create: createData<Prisma.StorefrontContactUncheckedCreateInput>(sf.id, input),
  });
  await touchStorefront(shopId);
  return result;
}

// ===== Social =====

export async function getSocial(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontSocial.findUnique({ where: { storefrontId: sf.id } });
}

export async function updateSocial(shopId: string, input: Prisma.StorefrontSocialUncheckedUpdateInput) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.storefrontSocial.upsert({
    where: { storefrontId: sf.id },
    update: input,
    create: createData<Prisma.StorefrontSocialUncheckedCreateInput>(sf.id, input),
  });
  await touchStorefront(shopId);
  return result;
}

// ===== Branding =====

export async function getBranding(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontBranding.findUnique({ where: { storefrontId: sf.id } });
}

export async function updateBranding(shopId: string, input: Prisma.StorefrontBrandingUncheckedUpdateInput) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.storefrontBranding.upsert({
    where: { storefrontId: sf.id },
    update: input,
    create: createData<Prisma.StorefrontBrandingUncheckedCreateInput>(sf.id, input),
  });
  await touchStorefront(shopId);
  return result;
}

// ===== SEO =====

export async function getSeo(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontSeo.findUnique({ where: { storefrontId: sf.id } });
}

export async function updateSeo(shopId: string, input: Prisma.StorefrontSeoUncheckedUpdateInput) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.storefrontSeo.upsert({
    where: { storefrontId: sf.id },
    update: input,
    create: createData<Prisma.StorefrontSeoUncheckedCreateInput>(sf.id, input),
  });
  await touchStorefront(shopId);
  return result;
}

// ===== Sections =====

export async function getSections(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontSection.findMany({
    where: { storefrontId: sf.id },
    orderBy: { sortOrder: 'asc' },
  });
}

// Replaces the entire section list (visibility + order).
export async function updateSections(shopId: string, items: { section: string; enabled: boolean; sortOrder: number }[]) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.$transaction(
    items.map((item) =>
      prisma.storefrontSection.upsert({
        where: { storefrontId_section: { storefrontId: sf.id, section: item.section } },
        update: { enabled: item.enabled, sortOrder: item.sortOrder },
        create: { storefrontId: sf.id, section: item.section, enabled: item.enabled, sortOrder: item.sortOrder },
      }),
    ),
  );
  await touchStorefront(shopId);
  return result;
}

// ===== Featured products =====

export async function getFeatured(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontFeatured.findMany({
    where: { storefrontId: sf.id },
    include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, sellingPrice: true } } },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function addFeatured(shopId: string, productId: string) {
  const sf = await initializeStorefront(shopId);
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product not found');
  const result = await prisma.storefrontFeatured.create({ data: { storefrontId: sf.id, productId } });
  await touchStorefront(shopId);
  return result;
}

export async function removeFeatured(shopId: string, featuredId: string) {
  const sf = await initializeStorefront(shopId);
  const row = await prisma.storefrontFeatured.findFirst({ where: { id: featuredId, storefrontId: sf.id } });
  if (!row) throw new NotFoundError('Featured product not found');
  await prisma.storefrontFeatured.delete({ where: { id: featuredId } });
  await touchStorefront(shopId);
}

export async function reorderFeatured(shopId: string, ids: string[]) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.$transaction(
    ids.map((id, index) =>
      prisma.storefrontFeatured.updateMany({
        where: { id, storefrontId: sf.id },
        data: { sortOrder: index },
      }),
    ),
  );
  await touchStorefront(shopId);
  return result;
}

// ===== Features (Why Choose Us) =====

export async function listFeatures(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontFeature.findMany({ where: { storefrontId: sf.id }, orderBy: { sortOrder: 'asc' } });
}

export async function createFeature(shopId: string, data: { title: string; description: string; icon?: string }) {
  const sf = await initializeStorefront(shopId);
  const count = await prisma.storefrontFeature.count({ where: { storefrontId: sf.id } });
  const result = await prisma.storefrontFeature.create({
    data: { storefrontId: sf.id, title: data.title, description: data.description, icon: data.icon ?? null, sortOrder: count },
  });
  await touchStorefront(shopId);
  return result;
}

export async function updateFeature(shopId: string, id: string, data: Partial<{ title: string; description: string; icon?: string; enabled: boolean }>) {
  const sf = await initializeStorefront(shopId);
  const existing = await prisma.storefrontFeature.findFirst({ where: { id, storefrontId: sf.id } });
  if (!existing) throw new NotFoundError('Feature not found');
  const result = await prisma.storefrontFeature.update({ where: { id }, data });
  await touchStorefront(shopId);
  return result;
}

export async function deleteFeature(shopId: string, id: string) {
  const sf = await initializeStorefront(shopId);
  const existing = await prisma.storefrontFeature.findFirst({ where: { id, storefrontId: sf.id } });
  if (!existing) throw new NotFoundError('Feature not found');
  await prisma.storefrontFeature.delete({ where: { id } });
  await touchStorefront(shopId);
}

export async function reorderFeatures(shopId: string, ids: string[]) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.$transaction(
    ids.map((id, index) =>
      prisma.storefrontFeature.updateMany({ where: { id, storefrontId: sf.id }, data: { sortOrder: index } }),
    ),
  );
  await touchStorefront(shopId);
  return result;
}

// ===== Testimonials =====

export async function listTestimonials(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontTestimonial.findMany({ where: { storefrontId: sf.id }, orderBy: { sortOrder: 'asc' } });
}

export async function createTestimonial(
  shopId: string,
  data: { customerName: string; role?: string; content: string; rating?: number; featured?: boolean; imageUrl?: string; imagePublicId?: string },
) {
  const sf = await initializeStorefront(shopId);
  const count = await prisma.storefrontTestimonial.count({ where: { storefrontId: sf.id } });
  const result = await prisma.storefrontTestimonial.create({
    data: {
      storefrontId: sf.id,
      customerName: data.customerName,
      role: data.role ?? null,
      content: data.content,
      rating: data.rating ?? 5,
      featured: data.featured ?? false,
      imageUrl: data.imageUrl ?? null,
      imagePublicId: data.imagePublicId ?? null,
      sortOrder: count,
    },
  });
  await touchStorefront(shopId);
  return result;
}

export async function updateTestimonial(
  shopId: string,
  id: string,
  data: Partial<{ customerName: string; role?: string; content: string; rating?: number; featured?: boolean; enabled: boolean; imageUrl?: string; imagePublicId?: string }>,
) {
  const sf = await initializeStorefront(shopId);
  const existing = await prisma.storefrontTestimonial.findFirst({ where: { id, storefrontId: sf.id } });
  if (!existing) throw new NotFoundError('Testimonial not found');
  const result = await prisma.storefrontTestimonial.update({ where: { id }, data });
  await touchStorefront(shopId);
  return result;
}

export async function deleteTestimonial(shopId: string, id: string) {
  const sf = await initializeStorefront(shopId);
  const existing = await prisma.storefrontTestimonial.findFirst({ where: { id, storefrontId: sf.id } });
  if (!existing) throw new NotFoundError('Testimonial not found');
  await prisma.storefrontTestimonial.delete({ where: { id } });
  await touchStorefront(shopId);
}

export async function reorderTestimonials(shopId: string, ids: string[]) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.$transaction(
    ids.map((id, index) =>
      prisma.storefrontTestimonial.updateMany({ where: { id, storefrontId: sf.id }, data: { sortOrder: index } }),
    ),
  );
  await touchStorefront(shopId);
  return result;
}

// ===== FAQ =====

export async function listFaqs(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontFaq.findMany({ where: { storefrontId: sf.id }, orderBy: { sortOrder: 'asc' } });
}

export async function createFaq(shopId: string, data: { question: string; answer: string }) {
  const sf = await initializeStorefront(shopId);
  const count = await prisma.storefrontFaq.count({ where: { storefrontId: sf.id } });
  const result = await prisma.storefrontFaq.create({
    data: { storefrontId: sf.id, question: data.question, answer: data.answer, sortOrder: count },
  });
  await touchStorefront(shopId);
  return result;
}

export async function updateFaq(shopId: string, id: string, data: Partial<{ question: string; answer: string; enabled: boolean }>) {
  const sf = await initializeStorefront(shopId);
  const existing = await prisma.storefrontFaq.findFirst({ where: { id, storefrontId: sf.id } });
  if (!existing) throw new NotFoundError('FAQ not found');
  const result = await prisma.storefrontFaq.update({ where: { id }, data });
  await touchStorefront(shopId);
  return result;
}

export async function deleteFaq(shopId: string, id: string) {
  const sf = await initializeStorefront(shopId);
  const existing = await prisma.storefrontFaq.findFirst({ where: { id, storefrontId: sf.id } });
  if (!existing) throw new NotFoundError('FAQ not found');
  await prisma.storefrontFaq.delete({ where: { id } });
  await touchStorefront(shopId);
}

export async function reorderFaqs(shopId: string, ids: string[]) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.$transaction(
    ids.map((id, index) =>
      prisma.storefrontFaq.updateMany({ where: { id, storefrontId: sf.id }, data: { sortOrder: index } }),
    ),
  );
  await touchStorefront(shopId);
  return result;
}

// ===== Navigation =====

export async function getNavigation(shopId: string) {
  const sf = await initializeStorefront(shopId);
  return prisma.storefrontNavItem.findMany({ where: { storefrontId: sf.id }, orderBy: { sortOrder: 'asc' } });
}

// Updates navigation by id when present (existing items), otherwise creates a
// new custom item. Custom (non-system) items removed from the list are deleted.
// System items (Home, Shop, Cart) are always preserved so required routes stay
// functional; they can be renamed, reordered or hidden but never removed.
export async function updateNavigation(
  shopId: string,
  items: { id?: string; label: string; href: string; enabled: boolean }[],
) {
  const sf = await initializeStorefront(shopId);
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.storefrontNavItem.findMany({ where: { storefrontId: sf.id } });
    const providedIds = new Set(items.filter((i) => i.id).map((i) => i.id as string));

    // Upsert provided items (renames/reorders/creates).
    for (const [index, item] of items.entries()) {
      if (item.id && existing.some((e) => e.id === item.id)) {
        await tx.storefrontNavItem.update({
          where: { id: item.id },
          data: { label: item.label.trim(), href: item.href.trim(), sortOrder: index, enabled: item.enabled },
        });
      } else {
        await tx.storefrontNavItem.create({
          data: { storefrontId: sf.id, label: item.label.trim(), href: item.href.trim(), sortOrder: index, enabled: item.enabled, isSystem: false },
        });
      }
    }

    // Delete custom items that were removed from the list.
    await tx.storefrontNavItem.deleteMany({
      where: { storefrontId: sf.id, isSystem: false, id: { notIn: Array.from(providedIds) } },
    });

    // Renumber everything by provided order, then reorderFor list with fresh sort.
    const current = await tx.storefrontNavItem.findMany({ where: { storefrontId: sf.id } });
    const ordered = items
      .map((i) => current.find((c) => c.label === i.label && c.href === i.href))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .concat(current.filter((c) => !items.some((i) => i.label === c.label && i.href === c.href)));
    await Promise.all(
      ordered.map((c, index) => tx.storefrontNavItem.update({ where: { id: c.id }, data: { sortOrder: index } })),
    );

    return tx.storefrontNavItem.findMany({ where: { storefrontId: sf.id }, orderBy: { sortOrder: 'asc' } });
  });
  await touchStorefront(shopId);
  return result;
}

// ===== Completeness score =====

export async function getCompleteness(shopId: string) {
  const sf = await ensureStorefront(shopId);
  const [hero, contact, branding, seo, productCount, faqCount, testimonialCount] = await Promise.all([
    prisma.storefrontHero.findUnique({ where: { storefrontId: sf.id } }),
    prisma.storefrontContact.findUnique({ where: { storefrontId: sf.id } }),
    prisma.storefrontBranding.findUnique({ where: { storefrontId: sf.id } }),
    prisma.storefrontSeo.findUnique({ where: { storefrontId: sf.id } }),
    prisma.product.count({ where: { shopId } }),
    prisma.storefrontFaq.count({ where: { storefrontId: sf.id } }),
    prisma.storefrontTestimonial.count({ where: { storefrontId: sf.id } }),
  ]);

  const items = [
    { key: 'name', label: 'Store name', done: Boolean(sf.storeName ?? undefined), value: sf.storeName ?? undefined },
    { key: 'logo', label: 'Logo', done: Boolean(sf.logoUrl), value: sf.logoUrl ?? undefined },
    { key: 'hero', label: 'Hero section', done: Boolean(hero?.title && hero?.imageUrl), value: hero?.title ?? undefined },
    { key: 'products', label: 'Products', done: productCount > 0, value: String(productCount) },
    { key: 'contact', label: 'Contact info', done: Boolean(contact?.phone || contact?.email), value: contact?.phone ?? contact?.email ?? undefined },
    { key: 'whatsapp', label: 'WhatsApp', done: Boolean(contact?.whatsappNumber), value: contact?.whatsappNumber ?? undefined },
    { key: 'branding', label: 'Branding', done: Boolean(branding?.primaryColor && branding?.primaryColor !== '#176B5B'), value: branding?.primaryColor ?? undefined },
    { key: 'about', label: 'About page', done: Boolean((await prisma.storefrontAbout.findUnique({ where: { storefrontId: sf.id } }))?.story), value: undefined },
    { key: 'faq', label: 'FAQ', done: faqCount > 0, value: String(faqCount) },
    { key: 'testimonials', label: 'Testimonials', done: testimonialCount > 0, value: String(testimonialCount) },
    { key: 'seo', label: 'SEO', done: Boolean(seo?.title && seo?.description), value: seo?.title ?? undefined },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const percent = Math.round((doneCount / items.length) * 100);

  return {
    percent,
    done: doneCount,
    total: items.length,
    items,
    status: sf.status,
    publishedAt: sf.publishedAt,
  };
}

// ===== Composite CMS config =====

export async function getStorefrontConfigForCms(shopId: string) {
  await initializeStorefront(shopId);
  const [sf, hero, about, contact, social, branding, seo, sections, featured, features, testimonials, faqs, nav, completeness] =
    await Promise.all([
      prisma.storefront.findUnique({ where: { shopId } }),
      getHero(shopId),
      getAbout(shopId),
      getContact(shopId),
      getSocial(shopId),
      getBranding(shopId),
      getSeo(shopId),
      getSections(shopId),
      getFeatured(shopId),
      listFeatures(shopId),
      listTestimonials(shopId),
      listFaqs(shopId),
      getNavigation(shopId),
      getCompleteness(shopId),
    ]);

  return {
    storefront: sf,
    hero,
    about,
    contact,
    social,
    branding,
    seo,
    sections,
    featured,
    features,
    testimonials,
    faqs,
    navigation: nav,
    completeness,
  };
}

// ===== Public storefront config =====
// Safe, marketing-only projection. Never exposes buying prices, profit,
// suppliers, internal stock thresholds, private customers, users or audits.

export async function getPublicStorefrontConfig(shopId: string) {
  const sf = await ensureStorefront(shopId);

  const [hero, about, contact, social, branding, seo, sections, featured, features, testimonials, faqs, nav, shop, categories] =
    await Promise.all([
      prisma.storefrontHero.findUnique({ where: { storefrontId: sf.id } }),
      prisma.storefrontAbout.findUnique({ where: { storefrontId: sf.id } }),
      prisma.storefrontContact.findUnique({ where: { storefrontId: sf.id } }),
      prisma.storefrontSocial.findUnique({ where: { storefrontId: sf.id } }),
      prisma.storefrontBranding.findUnique({ where: { storefrontId: sf.id } }),
      prisma.storefrontSeo.findUnique({ where: { storefrontId: sf.id } }),
      prisma.storefrontSection.findMany({ where: { storefrontId: sf.id }, orderBy: { sortOrder: 'asc' } }),
      prisma.storefrontFeatured.findMany({
        where: { storefrontId: sf.id },
        include: { product: { select: { id: true, name: true, slug: true, description: true, sellingPrice: true, imageUrl: true, quantity: true, lowStockThreshold: true, unit: true, isActive: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.storefrontFeature.findMany({
        where: { storefrontId: sf.id, enabled: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.storefrontTestimonial.findMany({
        where: { storefrontId: sf.id, enabled: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.storefrontFaq.findMany({
        where: { storefrontId: sf.id, enabled: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.storefrontNavItem.findMany({
        where: { storefrontId: sf.id, enabled: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.shop.findUnique({ where: { id: shopId } }),
      prisma.category.findMany({
        where: { shopId, visible: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          displayOrder: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);

  // Map candidate featured products into the public product shape, filtered to
  // active products with stock info, in the configured display order.
  const featuredProducts = featured
    .filter((f) => f.product?.isActive && f.product.quantity > 0)
    .map((f) => ({
      id: f.product.id,
      name: f.product.name,
      slug: f.product.slug,
      description: f.product.description,
      price: f.product.sellingPrice,
      unit: f.product.unit,
      imageUrl: f.product.imageUrl,
      stockStatus: f.product.quantity <= f.product.lowStockThreshold ? 'low' : 'in_stock',
      inStock: true,
      quantity: f.product.quantity,
    }));

  return {
    status: sf.status,
    storeName: sf.storeName ?? shop?.name ?? null,
    shopName: shop?.name ?? null,
    currency: shop?.currency ?? 'KES',
    tagline: sf.tagline,
    hero: {
      show: hero?.show ?? true,
      title: hero?.title ?? null,
      subtitle: hero?.subtitle ?? null,
      description: hero?.description ?? null,
      primaryText: hero?.primaryText ?? null,
      primaryLink: hero?.primaryLink ?? null,
      secondaryText: hero?.secondaryText ?? null,
      secondaryLink: hero?.secondaryLink ?? null,
      imageUrl: hero?.imageUrl ?? sf.heroImageUrl ?? null,
      backgroundEnabled: hero?.backgroundEnabled ?? false,
      alignment: hero?.alignment ?? 'left',
    },
    sections: sections.map((s) => ({ section: s.section, enabled: s.enabled, sortOrder: s.sortOrder })),
    featured: featuredProducts,
    features: features.map((f) => ({ id: f.id, title: f.title, description: f.description, icon: f.icon })),
    testimonials: testimonials.map((t) => ({
      id: t.id,
      customerName: t.customerName,
      role: t.role,
      content: t.content,
      rating: t.rating,
      imageUrl: t.imageUrl,
    })),
    faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    })),
    about: about
      ? {
          title: about.title,
          introduction: about.introduction,
          story: about.story,
          mission: about.mission,
          vision: about.vision,
          values: about.values,
          imageUrl: about.imageUrl,
          showTeam: about.showTeam,
          yearEstablished: sf.yearEstablished,
          customerCount: sf.customerCount,
        }
      : null,
    contact: {
      title: contact?.title ?? null,
      description: contact?.description ?? null,
      phone: contact?.phone ?? shop?.phone ?? null,
      whatsappNumber: contact?.whatsappNumber ?? null,
      whatsappMessage: contact?.whatsappMessage ?? null,
      email: contact?.email ?? shop?.email ?? null,
      location: contact?.location ?? shop?.location ?? null,
      address: contact?.address ?? null,
      mapsUrl: contact?.mapsUrl ?? null,
      openingHours: contact?.openingHours ?? null,
      showContactForm: contact?.showContactForm ?? true,
      showWhatsappBtn: contact?.showWhatsappBtn ?? true,
    },
    social: {
      facebook: social?.facebook ?? null,
      instagram: social?.instagram ?? null,
      tiktok: social?.tiktok ?? null,
      twitter: social?.twitter ?? null,
      youtube: social?.youtube ?? null,
      linkedin: social?.linkedin ?? null,
    },
    branding: {
      primaryColor: branding?.primaryColor ?? '#176B5B',
      secondaryColor: branding?.secondaryColor ?? '#17252D',
      accentColor: branding?.accentColor ?? '#D6A84F',
      buttonStyle: branding?.buttonStyle ?? 'rounded',
      radius: branding?.radius ?? 'smooth',
      font: branding?.font ?? 'inter',
    },
    logo: sf.logoUrl ?? shop?.logo ?? null,
    copyright: sf.copyright ?? null,
    navigation: nav.map((n) => ({ id: n.id, label: n.label, href: n.href, isSystem: n.isSystem })),
    seo: seo
      ? {
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords,
          ogImageUrl: seo.ogImageUrl,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
        }
      : null,
  };
}

