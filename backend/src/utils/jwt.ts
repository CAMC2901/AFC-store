import { Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { COOKIE_NAMES } from '../constants';
import { UnauthorizedError } from './error';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface RefreshTokenPayload {
  sub: string;
  version: number;
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload & JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload & JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired session. Please log in again.');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload & JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload & JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid refresh token.');
  }
};

/** Access token lives in a short-lived HTTP-only cookie. */
export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAMES.ACCESS, token, {
    httpOnly: true,
    secure: true, // Always true for cross-site
    sameSite: 'none', // Crucial for cross-site (Vercel -> Render)
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/',
  });
};

/** Refresh token in a long-lived HTTP-only cookie. */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAMES.REFRESH, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
};

export const clearAuthCookies = (res: Response): void => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
  };
  res.clearCookie(COOKIE_NAMES.ACCESS, { ...options, path: '/' });
  res.clearCookie(COOKIE_NAMES.REFRESH, { ...options, path: '/api/v1/auth' });
};
