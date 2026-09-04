// Centralized application errors with HTTP status codes and stable error codes.

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(409, code, message);
  }
}

export class InsufficientStockError extends AppError {
  available: number;
  requested: number;
  productName?: string;

  constructor(available: number, requested: number, productName?: string) {
    const namePart = productName ? ` (${productName})` : '';
    super(
      409,
      'INSUFFICIENT_STOCK',
      `Insufficient stock${namePart}. Available: ${available}. Requested: ${requested}.`,
    );
    this.available = available;
    this.requested = requested;
    this.productName = productName;
  }
}

export class DuplicateError extends AppError {
  constructor(message = 'Duplicate record') {
    super(409, 'DUPLICATE', message);
  }
}
