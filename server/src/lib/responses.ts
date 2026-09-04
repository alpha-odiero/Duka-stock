import type { Response } from 'express';

// Consistent API response helpers.
// Success: { success: true, data }
// Error:   { success: false, error: { code, message } }

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res: Response, data: unknown) {
  return res.status(201).json({ success: true, data });
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const error: Record<string, unknown> = { code, message };
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, error });
}
