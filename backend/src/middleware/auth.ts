import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/error';
import { repositories } from '../repositories/container';
import { Role } from '../types';

const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return req.cookies?.afc_access_token as string | undefined;
};

/**
 * Requires a valid access token (Authorization header or HTTP-only cookie).
 * Attaches req.user (sanitized) and req.userId to the request.
 */
export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    return next(new UnauthorizedError());
  }

  const payload = verifyAccessToken(token);
  const user = await repositories.users.findById(payload.sub);
  if (!user || !user.isActive) {
    return next(new UnauthorizedError('Account is no longer active.'));
  }

  const { passwordHash: _ph, refreshToken: _rt, ...safe } = user;
  req.user = safe;
  req.userId = user.id;
  return next();
};

/** Requires a specific role (e.g. ADMIN). Must run after requireAuth. */
export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    return next();
  };
};

/** Optional auth — sets req.user if a valid token exists, otherwise continues. */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await repositories.users.findById(payload.sub);
    if (user && user.isActive) {
      const { passwordHash: _ph, refreshToken: _rt, ...safe } = user;
      req.user = safe;
      req.userId = user.id;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  return next();
};
