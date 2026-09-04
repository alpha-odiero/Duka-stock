import type { NextFunction, Request, Response } from 'express';
import { consumeRateLimit } from '../services/rateLimit/rateLimit.service';
import { redisConfig } from '../config/env';

// Express middleware for distributed rate limiting. Falls back to allowing the
// request if Redis is unavailable (the app-level limits already provide a basic
// in-process guard).

interface RateLimitMiddlewareOptions {
  key: (req: Request) => string;
  limit: number;
  windowSeconds: number;
  message?: string;
}

export function redisRateLimit(opts: RateLimitMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rule = {
      key: `${redisConfig.keyPrefix}:rl:${opts.key(req)}`,
      limit: opts.limit,
      windowSeconds: opts.windowSeconds,
    };
    const result = await consumeRateLimit(rule);
    if (!result.allowed) {
      res.setHeader('Retry-After', String(result.retryInSeconds));
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: opts.message ?? 'Too many requests. Please try again later.' },
      });
    }
    next();
  };
}
