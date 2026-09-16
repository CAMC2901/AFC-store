import express, { Express, NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { API_PREFIX } from './constants';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import userRoutes from './routes/user.routes';
import accountRoutes from './routes/account.routes';
import miscRoutes from './routes/misc.routes';
import adminRoutes from './routes/admin.routes';
import assistantRoutes from './routes/assistant.routes';
import { errorHandler, ApiError } from './utils/error';
import { generalLimiter } from './middleware/rateLimiter';
import { sanitize } from './middleware/sanitize';
import { verifyCsrf } from './middleware/csrf';

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // API only — no HTML to protect
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS (credentials allowed for HTTP-only cookies)
  app.use(cors(corsOptions));

  // Body parsing (50mb to allow base64 image uploads for products and categories)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // CSRF protection + Global rate limiting + input sanitization
  app.use(verifyCsrf);
  app.use(generalLimiter);
  app.use(sanitize);

  // Trust proxy (needed for accurate client IPs behind a reverse proxy)
  app.set('trust proxy', 1);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Versioned API routes
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/products`, productRoutes);
  app.use(`${API_PREFIX}/cart`, cartRoutes);
  app.use(`${API_PREFIX}/user`, userRoutes);
  app.use(`${API_PREFIX}/account`, accountRoutes);
  app.use(`${API_PREFIX}/assistant`, assistantRoutes);
  app.use(`${API_PREFIX}`, miscRoutes);
  app.use(`${API_PREFIX}/admin`, adminRoutes);

  // 404 for unknown API routes
  app.use(`${API_PREFIX}/*`, (_req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError(404, 'Endpoint not found.'));
  });

  // Central error handler
  app.use(errorHandler);

  return app;
};
