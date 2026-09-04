import { createApp } from './app';
import { cloudinaryConfigured, env } from './config/env';
import { prisma } from './lib/prisma';
import { logger } from './lib/logger';
import { connectRedis, disconnectRedis } from './infrastructure/redis/redis.client';
import { startWorkers, stopWorkers } from './workers';
import { ensurePermissionCatalog, reconcileSystemRoles } from './services/bootstrap.service';

const app = createApp();

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info(`Connected to PostgreSQL database`);
  } catch (error) {
    logger.error('Failed to connect to database', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Connect Redis. Non-fatal if unavailable (fail-open to the database).
  const redisReady = await connectRedis();
  (globalThis as unknown as { __redisReady?: boolean }).__redisReady = redisReady;

  // Start background workers (only once Redis is available).
  if (redisReady) {
    await startWorkers();
  }

  // Ensure the global permission catalog exists so role permission checks work.
  try {
    await ensurePermissionCatalog();
  } catch (error) {
    logger.error('Failed to seed permission catalog', {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  // Bring pre-existing shops' system roles up to date with the current catalog.
  // This is what fixes "Couldn't load staff" (403): roles created before a
  // permission like staff.view was added were never given that permission.
  try {
    await reconcileSystemRoles();
  } catch (error) {
    logger.error('Failed to reconcile system role permissions', {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  // Surface Cloudinary config state clearly for developers/operators without
  // ever exposing the API secret. Image uploads are the only affected feature.
  if (!env.isTest) {
    logger.info(
      cloudinaryConfigured
        ? 'Cloudinary image uploads: enabled'
        : 'Cloudinary image uploads: DISABLED (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server to enable uploads).',
    );
  }

  app.listen(env.port, () => {
    logger.info(`DukaStock API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((error) => {
  logger.error('Bootstrap failed', { error: String(error) });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  logger.info('Shutting down gracefully...');
  stopWorkers().then(() =>
    Promise.all([prisma.$disconnect(), disconnectRedis()])
      .then(() => process.exit(0))
      .catch(() => process.exit(1)),
  );
}
