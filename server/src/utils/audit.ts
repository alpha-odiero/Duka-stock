import type { Request } from 'express';
import { prisma } from '../lib/prisma';

// Records an audit log entry. Non-blocking: we log on best-effort basis and
// never let audit failures break business logic.
export async function auditLog(opts: {
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  req?: Request;
}) {
  try {
    const shopId = opts.req?.user?.shop?.id ?? opts.req?.user?.shopId ?? null;
    const userId = opts.req?.user?.id ?? null;
    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId,
        metadata: opts.metadata ? (opts.metadata as object) : undefined,
        ipAddress: opts.req?.ip ?? null,
        userAgent: opts.req?.get('user-agent') ?? null,
      },
    });
  } catch (error) {
    // Log silently; audit failure should not break the request.
    // eslint-disable-next-line no-console
    console.error('Audit log failure', error);
  }
}
