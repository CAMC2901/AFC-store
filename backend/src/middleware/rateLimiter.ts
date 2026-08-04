import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../constants';
import { ApiError } from '../utils/error';

/** General API rate limiter. */
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.general.windowMs,
  max: RATE_LIMIT.general.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response, next: NextFunction) =>
    next(new ApiError(429, 'Too many requests. Please try again later.')),
});

/** Stricter limiter for authentication endpoints (brute-force protection). */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.auth.windowMs,
  max: RATE_LIMIT.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response, next: NextFunction) =>
    next(new ApiError(429, 'Too many login attempts. Please try again in 15 minutes.')),
});

/** Newsletter subscription limiter (spam protection). */
export const newsletterLimiter = rateLimit({
  windowMs: RATE_LIMIT.newsletter.windowMs,
  max: RATE_LIMIT.newsletter.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response, next: NextFunction) =>
    next(new ApiError(429, 'Too many subscription attempts. Please try again later.')),
});
