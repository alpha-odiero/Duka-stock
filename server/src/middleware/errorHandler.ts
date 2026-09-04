import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors';
import { fail } from '../lib/responses';
import { logger } from '../lib/logger';

// Centralized error handler. Never leaks stack traces to clients in production.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  // Known application errors
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.code, err.message, err.details);
  }

  // Prisma-known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[] | undefined) ?? [];
        return fail(res, 409, 'DUPLICATE', `Duplicate value for: ${target.join(', ')}`);
      }
      case 'P2025':
        return fail(res, 404, 'NOT_FOUND', 'Resource not found');
      case 'P2003':
        return fail(res, 400, 'FK_CONSTRAINT', 'Related record constraint failed');
      default:
        break;
    }
  }

  // Multer / body parsing / generic input errors
  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.parse.failed') {
    return fail(res, 400, 'INVALID_JSON', 'Malformed JSON in request body');
  }

  logger.error('Unhandled error', {
    url: req.originalUrl,
    method: req.method,
    message: err instanceof Error ? err.message : String(err),
    stack: envIsProd() ? undefined : err instanceof Error ? err.stack : undefined,
  });

  const status = err instanceof Error && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
    ? (err as { status: number }).status
    : 500;

  return fail(
    res,
    status >= 400 && status < 600 ? status : 500,
    'INTERNAL_ERROR',
    envIsProd() ? 'Something went wrong' : err instanceof Error ? err.message : 'Something went wrong',
  );
}

function envIsProd() {
  return process.env.NODE_ENV === 'production';
}

export function notFoundHandler(req: Request, res: Response) {
  return fail(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
}
