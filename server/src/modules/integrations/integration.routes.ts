import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { NotFoundError } from '../../lib/errors';
import { auditLog } from '../../utils/audit';
import { encryptSecret, maskSecret } from '../../utils/crypto';
import { integrationSchema, integrationUpdateSchema } from './integration.schema';

const router = Router();
router.use(requireAuth, requireShop);

// List integrations. Credentials are never returned; only a masked preview.
async function maskRow(raw: {
  id: string;
  provider: string;
  label: string;
  description: string | null;
  status: string;
  encryptedCredential: string | null;
  maskedValue: string | null;
  config: unknown;
  connectedAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: raw.id,
    provider: raw.provider,
    label: raw.label,
    description: raw.description,
    status: raw.status,
    maskedValue: raw.maskedValue ?? (raw.encryptedCredential ? '••••••••••••' : null),
    config: raw.config,
    connectedAt: raw.connectedAt,
    lastError: raw.lastError,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

router.get('/', requirePermission(PERMISSIONS.INTEGRATIONS_VIEW), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const rows = await prisma.apiIntegration.findMany({ where: { shopId }, orderBy: { provider: 'asc' } });
    const integrations = await Promise.all(rows.map(maskRow));
    return ok(res, { integrations });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE), validate(integrationSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const { provider, label, description, credential, config } = req.body;

    const encrypted = credential ? encryptSecret(credential) : null;
    const masked = credential ? maskSecret(credential) : null;

    const integration = await prisma.apiIntegration.upsert({
      where: { shopId_provider: { shopId, provider } },
      update: {
        label,
        description: description ?? null,
        encryptedCredential: encrypted,
        maskedValue: masked,
        config: config ?? undefined,
        status: credential ? 'CONNECTED' : 'CONNECTED',
        connectedAt: new Date(),
        lastError: null,
      },
      create: {
        shopId,
        provider,
        label,
        description: description ?? null,
        encryptedCredential: encrypted,
        maskedValue: masked,
        config: config ?? undefined,
        status: 'CONNECTED',
        connectedAt: new Date(),
      },
    });

    await auditLog({ action: 'INTEGRATION_CONNECTED', entityType: 'ApiIntegration', entityId: integration.id, req });
    return ok(res, { integration: await maskRow(integration) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE), validate(integrationUpdateSchema), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.apiIntegration.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Integration not found');

    const data: Record<string, unknown> = {};
    if (req.body.label !== undefined) data.label = req.body.label;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.config !== undefined) data.config = req.body.config;
    if (req.body.credential !== undefined) {
      data.encryptedCredential = req.body.credential ? encryptSecret(req.body.credential) : null;
      data.maskedValue = req.body.credential ? maskSecret(req.body.credential) : null;
    }

    const integration = await prisma.apiIntegration.update({ where: { id: existing.id }, data });
    await auditLog({ action: 'INTEGRATION_UPDATED', entityType: 'ApiIntegration', entityId: integration.id, req });
    return ok(res, { integration: await maskRow(integration) });
  } catch (error) {
    next(error);
  }
});

// Disconnect: clear the credential but keep the integration record/config so the
// user can reconfigure easily.
router.post('/:id/disconnect', requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.apiIntegration.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Integration not found');
    const integration = await prisma.apiIntegration.update({
      where: { id: existing.id },
      data: { status: 'DISCONNECTED', encryptedCredential: null, maskedValue: null, lastError: null },
    });
    await auditLog({ action: 'INTEGRATION_DISCONNECTED', entityType: 'ApiIntegration', entityId: integration.id, req });
    return ok(res, { integration: await maskRow(integration) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE), async (req, res, next) => {
  try {
    const shopId = req.user!.shop!.id;
    const existing = await prisma.apiIntegration.findFirst({ where: { id: req.params.id, shopId } });
    if (!existing) throw new NotFoundError('Integration not found');
    await prisma.apiIntegration.delete({ where: { id: existing.id } });
    await auditLog({ action: 'INTEGRATION_DELETED', entityType: 'ApiIntegration', entityId: existing.id, req });
    return ok(res, { message: 'Integration deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
