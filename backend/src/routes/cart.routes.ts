import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  couponPreviewSchema,
  estimateShippingSchema,
  updateCartItemSchema,
} from '../validators/cart';

const router = Router();

router.use(requireAuth);

router.get('/', CartController.get);
router.post('/items', validate(addToCartSchema), CartController.add);
router.put('/items', validate(updateCartItemSchema), CartController.update);
router.delete('/items', validate(updateCartItemSchema.pick({ productId: true })), CartController.remove);
router.delete('/', CartController.clear);
router.post('/totals', validate(estimateShippingSchema), CartController.totals);
router.post('/coupon/validate', validate(couponPreviewSchema), CartController.validateCoupon);

export default router;
