import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../lib/errors';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      next(new ValidationError('Invalid input', fieldErrors));
      return;
    }
    // Replace the parsed (and coerced) value so downstream sees valid data.
    Object.defineProperty(req, source, { value: result.data, configurable: true });
    next();
  };
}
