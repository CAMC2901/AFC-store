import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { listProductsSchema, productSlugSchema } from '../validators/product';

const router = Router();

router.get('/categories', ProductController.categories);
router.get('/featured', ProductController.featured);
router.get('/bestsellers', ProductController.bestsellers);
router.get('/price-range', ProductController.priceRange);
router.get('/', validate(listProductsSchema, 'query'), ProductController.list);
router.get('/:slug', validate(productSlugSchema, 'params'), ProductController.getBySlug);

export default router;
