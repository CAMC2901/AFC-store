import { Router } from 'express';
import { MiscController } from '../controllers/admin.controller';
import { newsletterLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { contactSchema, newsletterSubscribeSchema } from '../validators/misc';

const router = Router();

router.post('/newsletter', newsletterLimiter, validate(newsletterSubscribeSchema), MiscController.subscribe);
router.get('/testimonials', MiscController.testimonials);
router.post('/contact', validate(contactSchema), MiscController.contact);
router.get('/config', MiscController.config);

export default router;
