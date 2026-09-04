import express from 'express';
import type { Express } from 'express';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { redisRateLimit } from './middleware/rateLimit';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS — restrict to the configured client origin. Never "*" in production.
  const allowedOrigins = env.clientUrl.split(',');
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (e.g. curl, tests) that omit the origin.
        if (!origin || env.isTest) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Global rate limit — protects all API routes from abuse. A distributed
  // Redis-backed limiter (keyed per IP) plus an in-process fallback guard keep
  // this correct and scalable across multiple instances.
  app.use(
    '/api',
    redisRateLimit({
      key: (req) => `global:${req.ip ?? 'unknown'}`,
      limit: 500,
      windowSeconds: 15 * 60,
      message: 'Too many requests. Please try again later.',
    }),
  );

  // Stricter rate limit for authentication endpoints.
  app.use(
    '/api/v1/auth',
    redisRateLimit({
      key: (req) => `auth:${req.ip ?? 'unknown'}`,
      limit: 30,
      windowSeconds: 15 * 60,
      message: 'Too many attempts. Please try again later.',
    }),
  );

  // Health check
  app.get('/health', async (_req, res) => {
    const redisStatus = (globalThis as unknown as { __redisReady?: boolean }).__redisReady ? 'ok' : 'down';
    res.json({ status: 'ok', redis: redisStatus });
  });

  // API routes
  app.use('/api/v1', routes);

  // In production, serve the built client and let React Router handle SPA routes.
  // Static serving is skipped in development/test where Vite proxies the API.
  if (env.isProduction) {
    const staticDir = process.env.STATIC_DIR || path.resolve(__dirname, '../../client/dist');
    if (fs.existsSync(staticDir)) {
      app.use(express.static(staticDir));
      app.get('*', (req, res, next) => {
        // Never hijack API 404s; let the central error handler respond.
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(staticDir, 'index.html'));
      });
    }
  }

  // 404 for unmatched routes
  app.use(notFoundHandler);

  // Centralized error handling (must be last)
  app.use(errorHandler);

  return app;
}
