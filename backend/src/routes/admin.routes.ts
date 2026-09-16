import { Router } from 'express';
import { z } from 'zod';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  categoryIdSchema,
  createCategorySchema,
  createProductSchema,
  productIdSchema,
  updateCategorySchema,
  updateProductSchema,
} from '../validators/product';
import { orderIdSchema, updateOrderStatusSchema } from '../validators/order';
import { couponCreateSchema, couponIdSchema, couponUpdateSchema } from '../validators/misc';

const stockAdjustSchema = z.object({
  delta: z.coerce.number().int().min(-999999).max(999999),
});

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

// ---- Analytics ----
router.get('/analytics', AdminController.analytics);

// ---- Products ----
router.get('/products', AdminController.listProducts);
router.post('/products', validate(createProductSchema), AdminController.createProduct);
router.patch('/products/:id', validate(productIdSchema, 'params'), validate(updateProductSchema), AdminController.updateProduct);
router.delete('/products/:id', validate(productIdSchema, 'params'), AdminController.deleteProduct);
router.post('/products/:id/stock', validate(productIdSchema, 'params'), validate(stockAdjustSchema), AdminController.adjustStock);

// ---- Categories ----
router.get('/categories', AdminController.listCategories);
router.post('/categories', validate(createCategorySchema), AdminController.createCategory);
router.patch('/categories/:id', validate(categoryIdSchema, 'params'), validate(updateCategorySchema), AdminController.updateCategory);
router.delete('/categories/:id', validate(categoryIdSchema, 'params'), AdminController.deleteCategory);

// ---- Orders ----
router.get('/orders', AdminController.listOrders);
router.get('/orders/:id', validate(orderIdSchema, 'params'), AdminController.getOrder);
router.patch('/orders/:id/status', validate(orderIdSchema, 'params'), validate(updateOrderStatusSchema), AdminController.updateOrderStatus);

// ---- Customers ----
router.get('/customers', AdminController.listCustomers);

// ---- Coupons ----
router.get('/coupons', AdminController.listCoupons);
router.post('/coupons', validate(couponCreateSchema), AdminController.createCoupon);
router.patch('/coupons/:id', validate(couponIdSchema, 'params'), validate(couponUpdateSchema), AdminController.updateCoupon);
router.delete('/coupons/:id', validate(couponIdSchema, 'params'), AdminController.deleteCoupon);

export default router;
