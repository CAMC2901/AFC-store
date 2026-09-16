import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', authLimiter, AuthController.refresh);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

export default router;
