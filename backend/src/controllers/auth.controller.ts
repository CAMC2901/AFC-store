import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken, setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from '../utils/jwt';
import { success, UnauthorizedError } from '../utils/error';
import { COOKIE_NAMES } from '../constants';
import { LoginInput, RegisterInput } from '../validators/auth';

export const AuthController = {
  register: async (req: Request, res: Response) => {
    const input = req.body as RegisterInput;
    const user = await AuthService.register(input);
    await issueTokens(res, user.id, user.email, user.role);
    res.status(201).json(success({ user }, 'Account created successfully.'));
  },

  login: async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const { user } = await AuthService.login(input);
    await issueTokens(res, user.id, user.email, user.role);
    res.json(success({ user }, 'Logged in successfully.'));
  },

  logout: async (req: Request, res: Response) => {
    if (req.userId) await AuthService.setRefreshToken(req.userId, null);
    clearAuthCookies(res);
    res.json(success(null, 'Logged out successfully.'));
  },

  refresh: async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH] as string | undefined;
    if (!refreshToken) throw new UnauthorizedError('No refresh token provided.');

    const payload = verifyRefreshToken(refreshToken);
    const valid = await AuthService.validateStoredRefreshToken(payload.sub, refreshToken);
    if (!valid) throw new UnauthorizedError('Session is no longer valid. Please log in again.');

    const user = await AuthService.refreshUser(payload.sub);
    await issueTokens(res, user.id, user.email, user.role);
    res.json(success({ user }, 'Session refreshed.'));
  },

  me: async (req: Request, res: Response) => {
    const user = await AuthService.refreshUser(req.userId!);
    res.json(success({ user }));
  },
};

/** Issues both JWTs and writes them to HTTP-only cookies. */
const issueTokens = async (res: Response, userId: string, email: string, role: 'ADMIN' | 'CUSTOMER') => {
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken({ sub: userId, version: 1 });
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  await AuthService.setRefreshToken(userId, refreshToken);
};
