import { repositories } from '../repositories/container';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/error';
import { hashPassword, verifyPassword } from '../utils/password';
import { PublicUser, User } from '../types';

const sanitizeUser = (user: User): PublicUser => {
  const { passwordHash: _ph, refreshToken: _rt, ...safe } = user;
  return safe;
};

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const AuthService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const existing = await repositories.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await repositories.users.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });
    return sanitizeUser(user);
  },

  async login(input: LoginInput): Promise<{ user: PublicUser }> {
    const user = await repositories.users.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password.');
    }
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password.');
    }
    return { user: sanitizeUser(user) };
  },

  async refreshUser(userId: string): Promise<PublicUser> {
    const user = await repositories.users.findById(userId);
    if (!user) throw new NotFoundError('User');
    return sanitizeUser(user);
  },

  async setRefreshToken(userId: string, token: string | null): Promise<void> {
    await repositories.users.setRefreshToken(userId, token);
  },

  async validateStoredRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await repositories.users.findById(userId);
    if (!user || !user.refreshToken) return false;
    return user.refreshToken === token;
  },
};
