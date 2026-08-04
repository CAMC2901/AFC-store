import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration.
 * All secrets live in the server only and are never exposed to the client.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Allow running in dev without throwing so the API boots with sane defaults.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[env] Missing environment variable: ${name}`);
      return '';
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
  },

  databaseUrl: process.env.DATABASE_URL ?? '',
  prismaEnabled: process.env.PRISMA_ENABLED === 'true',
} as const;

export const isProduction = env.nodeEnv === 'production';
