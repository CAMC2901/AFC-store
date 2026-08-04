import type { CorsOptions } from 'cors';
import { env } from './env';

/**
 * CORS configuration — locked down to the trusted client origin only.
 */
export const corsOptions: CorsOptions = {
  origin: env.clientUrl,
  credentials: true, // required for HTTP-only cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400,
};
