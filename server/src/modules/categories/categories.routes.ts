import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { ConflictError, NotFoundError } from '../../lib/errors';
import { auditLog } from '../../utils/audit';
import { categoryCreateSchema, categoryReorderSchema, categoryUpdateSchema } from './categories.schema';

const router = Router();
router.use(requireAuth, requireShop);

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(shopId: string, name: string, excludeId?: string) {
  const base = slugify(name) || 'category';
  let candidate = base;
  let n = 2;
  const maxAttempts = 1000; // Prevent infinite loops

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const existing = await prisma.category.findFirst({
      where: { shopId, slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }

  // Fallback if max attempts reached
  return `${base}-${Date.now()}`;
}

router.get('/', requirePermission(PERMISSIONS.CATEGORIES_VIEW), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const categories = await prisma.category.findMany({
      where: { shopId },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    return ok(res, { categories });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.CATEGORIES_CREATE), validate(categoryCreateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const name = req.body.name.trim();
    const exists = await prisma.category.findFirst({ where: { shopId, name } });
    if (exists) throw new ConflictError('A category with this name already exists');
    const slug = await uniqueSlug(shopId, name);
    const maxOrder = await prisma.category.aggregate({ where: { shopId }, _max: { displayOrder: true } });
    const category = await prisma.category.create({
      data: {
        shopId,
        name,
        slug,
        description: req.body.description ?? null,
        imageUrl: req.body.imageUrl ?? null,
        imagePublicId: req.body.imagePublicId ?? null,
        displayOrder: req.body.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1,
        visible: req.body.visible ?? true,
      },
    });
    await auditLog({ action: 'CATEGORY_CREATED', entityType: 'Category', entityId: category.id, req });
    return created(res, { category });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermission(PERMISSIONS.CATEGORIES_EDIT), validate(categoryUpdateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.category.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Category not found');

    const data: Record<string, unknown> = {};
    if (req.body.name !== undefined) {
      const name = req.body.name.trim();
      const dup = await prisma.category.findFirst({ where: { shopId, name, id: { not: req.params.id } } });
      if (dup) throw new ConflictError('A category with this name already exists');
      data.name = name;
      if (req.body.name !== existing.name) data.slug = await uniqueSlug(shopId, name, existing.id);
    }
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.imageUrl !== undefined) data.imageUrl = req.body.imageUrl;
    if (req.body.imagePublicId !== undefined) data.imagePublicId = req.body.imagePublicId;
    if (req.body.displayOrder !== undefined) data.displayOrder = req.body.displayOrder;
    if (req.body.visible !== undefined) data.visible = req.body.visible;

    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    await auditLog({ action: 'CATEGORY_UPDATED', entityType: 'Category', entityId: category.id, req });
    return ok(res, { category });
  } catch (error) {
    next(error);
  }
});

// Reorder categories by a list of ids (displayOrder assigned by position).
router.put('/reorder', requirePermission(PERMISSIONS.CATEGORIES_EDIT), validate(categoryReorderSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const ids = req.body.ids as string[];
    const cats = await prisma.category.findMany({ where: { shopId, id: { in: ids } }, select: { id: true } });
    const owned = new Set(cats.map((c) => c.id));
    if (ids.some((id) => !owned.has(id))) throw new NotFoundError('One or more categories not found');
    await prisma.$transaction(ids.map((id, index) => prisma.category.update({ where: { id }, data: { displayOrder: index } })));
    await auditLog({ action: 'CATEGORY_REORDERED', entityType: 'Category', req });
    return ok(res, { message: 'Categories reordered' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission(PERMISSIONS.CATEGORIES_DELETE), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, shopId },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) throw new NotFoundError('Category not found');
    if (existing._count.products > 0) {
      throw new ConflictError(
        'This category still has products assigned to it. Reassign or delete those products first.',
      );
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    await auditLog({ action: 'CATEGORY_DELETED', entityType: 'Category', entityId: req.params.id, req });
    return ok(res, { message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
