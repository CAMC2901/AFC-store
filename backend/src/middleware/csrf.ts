import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/error';
import { env } from '../config/env';

/**
 * CSRF Protection Middleware.
 * Validates Origin/Referer headers on state-changing requests (POST, PUT, PATCH, DELETE)
 * when requests carry cookie-based authentication.
 */
export const verifyCsrf = (req: Request, _res: Response, next: NextFunction): void => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Requests with explicit Authorization header (Bearer tokens) are not vulnerable to browser CSRF.
  const hasBearerAuth = Boolean(req.headers.authorization?.startsWith('Bearer '));
  const hasCookieAuth = Boolean(req.cookies?.afc_access_token || req.cookies?.afc_refresh_token);

  if (hasBearerAuth || !hasCookieAuth) {
    return next();
  }

  // Validate Origin or Referer against clientUrl
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    if (origin !== env.clientUrl && !origin.includes('localhost') && !origin.endsWith('.vercel.app')) {
      return next(new ForbiddenError('Invalid request origin (CSRF check failed).'));
    }
  } else if (referer) {
    if (!referer.startsWith(env.clientUrl) && !referer.includes('localhost') && !referer.includes('.vercel.app')) {
      return next(new ForbiddenError('Invalid request referer (CSRF check failed).'));
    }
  }

  next();
};

