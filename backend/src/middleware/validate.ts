import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware factory that validates a request part (body, query, params)
 * against a Zod schema. Zod errors are handled by the central error handler
 * (see utils/error.ts) which flattens them into field-level messages.
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    // Replace the validated (and coerced) value back onto the request.
    (req as unknown as Record<string, unknown>)[source] = result.data;
    return next();
  };
};
