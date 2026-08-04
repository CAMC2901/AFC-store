import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { AsyncHandler } from '../types/express';

/** Error with an HTTP status code. */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized. Please log in.') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(403, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
  }
}

/** Wraps async handlers so rejections reach the central error middleware. */
export const catchAsync = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/** Central error handler — never leaks internals in production. */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  console.error('[UnhandledError]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

/** Consistent success payload shape. */
export const success = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data,
});
