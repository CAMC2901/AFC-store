import { Router } from 'express';
import { z } from 'zod';
import { OrderController, WishlistController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../validators/cart';
import { orderIdSchema, listOrdersSchema } from '../validators/order';
import { wishlistProductIdSchema } from '../validators/misc';

const estimateOnlySchema = z.object({
  couponCode: z.string().trim().max(40).optional().or(z.literal('')),
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
});

const router = Router();

router.use(requireAuth);

router.post('/checkout', validate(checkoutSchema), OrderController.checkout);
router.post('/estimate', validate(estimateOnlySchema), OrderController.estimate);
router.get('/orders', validate(listOrdersSchema, 'query'), OrderController.myOrders);
router.get('/orders/:id', validate(orderIdSchema, 'params'), OrderController.getById);

router.get('/wishlist', WishlistController.list);
router.post('/wishlist/:productId', validate(wishlistProductIdSchema, 'params'), WishlistController.toggle);
router.delete('/wishlist/:productId', validate(wishlistProductIdSchema, 'params'), WishlistController.remove);

export default router;
