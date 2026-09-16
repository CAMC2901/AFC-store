import { repositories } from '../repositories/container';
import { env } from '../config/env';
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

  async forgotPassword(email: string): Promise<{ message: string; devResetToken?: string }> {
    const user = await repositories.users.findByEmail(email);
    if (!user) {
      return {
        message: 'Si el correo está registrado, se han enviado las instrucciones de recuperación.',
      };
    }
    const devResetToken = 'AFC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const resetUrl = `${env.clientUrl}/reset-password?email=${encodeURIComponent(user.email)}&token=${devResetToken}`;

    // Disparar Webhook de n8n si la URL está configurada en .env
    if (env.n8nWebhookUrl) {
      try {
        await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            resetToken: devResetToken,
            resetUrl,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('[n8n Webhook Failed]', err);
      }
    }

    return {
      message: 'Se han enviado las instrucciones de recuperación de contraseña a tu correo electrónico.',
      devResetToken,
    };
  },

  async resetPassword(email: string, _resetToken: string, newPassword: string): Promise<{ message: string }> {
    const user = await repositories.users.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Usuario');
    }
    const newPasswordHash = await hashPassword(newPassword);
    await repositories.users.update(user.id, { passwordHash: newPasswordHash });
    return { message: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.' };
  },
};
