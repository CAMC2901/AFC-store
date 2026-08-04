import { Request, Response } from 'express';
import { NewsletterService, TestimonialService, ContactService } from '../services/misc.service';
import { repositories } from '../repositories/container';
import { success, NotFoundError } from '../utils/error';
import { ProductService } from '../services/product.service';

export const MiscController = {
  subscribe: async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };
    const subscriber = await NewsletterService.subscribe(email);
    res.status(201).json(success({ email: subscriber.email }, 'Subscribed successfully.'));
  },

  testimonials: async (_req: Request, res: Response) => {
    const testimonials = await TestimonialService.list();
    res.json(success(testimonials));
  },

  contact: async (req: Request, res: Response) => {
    const result = await ContactService.submit(req.body);
    res.status(201).json(success(result, 'Message sent. We will respond within 24 hours.'));
  },

  config: async (_req: Request, res: Response) => {
    const [categories, priceRange] = await Promise.all([
      repositories.categories.findAll(),
      ProductService.priceRange(),
    ]);
    res.json(success({ categories, priceRange }));
  },
};

export const AdminController = {
  // ---- Products ----
  listProducts: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await repositories.products.findAll({ page, limit });
    res.json(success(result));
  },

  createProduct: async (req: Request, res: Response) => {
    const category = await repositories.categories.findById(req.body.categoryId);
    if (!category) throw new NotFoundError('Category');
    const product = await ProductService.create({
      ...req.body,
      categorySlug: category.slug,
      categoryName: category.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    });
    res.status(201).json(success({ product }, 'Product created.'));
  },

  updateProduct: async (req: Request, res: Response) => {
    const product = await ProductService.update(req.params.id, req.body);
    res.json(success({ product }, 'Product updated.'));
  },

  deleteProduct: async (req: Request, res: Response) => {
    await ProductService.remove(req.params.id);
    res.json(success(null, 'Product deleted.'));
  },

  adjustStock: async (req: Request, res: Response) => {
    const { delta } = req.body as { delta: number };
    const product = await ProductService.adjustStock(req.params.id, delta);
    res.json(success({ product }, 'Inventory updated.'));
  },

  // ---- Categories ----
  listCategories: async (_req: Request, res: Response) => {
    const categories = await repositories.categories.findAll();
    res.json(success(categories));
  },

  createCategory: async (req: Request, res: Response) => {
    const category = await repositories.categories.create(req.body);
    res.status(201).json(success({ category }, 'Category created.'));
  },

  updateCategory: async (req: Request, res: Response) => {
    const category = await repositories.categories.update(req.params.id, req.body);
    if (!category) throw new NotFoundError('Category');
    res.json(success({ category }, 'Category updated.'));
  },

  deleteCategory: async (req: Request, res: Response) => {
    const ok = await repositories.categories.delete(req.params.id);
    if (!ok) throw new NotFoundError('Category');
    res.json(success(null, 'Category deleted.'));
  },

  // ---- Orders ----
  listOrders: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = req.query.status as string | undefined;
    const result = await repositories.orders.findAll(page, limit, status);
    res.json(success(result));
  },

  getOrder: async (req: Request, res: Response) => {
    const order = await repositories.orders.findById(req.params.id);
    if (!order) throw new NotFoundError('Order');
    res.json(success({ order }));
  },

  updateOrderStatus: async (req: Request, res: Response) => {
    const order = await repositories.orders.updateStatus(req.params.id, req.body.status);
    if (!order) throw new NotFoundError('Order');
    res.json(success({ order }, 'Order status updated.'));
  },

  // ---- Customers ----
  listCustomers: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await repositories.users.findAll(page, limit);
    const sanitized = {
      ...result,
      items: result.items.map((u) => {
        const { passwordHash: _ph, refreshToken: _rt, ...safe } = u;
        return safe;
      }),
    };
    res.json(success(sanitized));
  },

  // ---- Coupons ----
  listCoupons: async (_req: Request, res: Response) => {
    const coupons = await repositories.coupons.findAll();
    res.json(success(coupons));
  },

  createCoupon: async (req: Request, res: Response) => {
    const coupon = await repositories.coupons.create(req.body);
    res.status(201).json(success({ coupon }, 'Coupon created.'));
  },

  updateCoupon: async (req: Request, res: Response) => {
    const coupon = await repositories.coupons.update(req.params.id, req.body);
    if (!coupon) throw new NotFoundError('Coupon');
    res.json(success({ coupon }, 'Coupon updated.'));
  },

  deleteCoupon: async (req: Request, res: Response) => {
    const ok = await repositories.coupons.delete(req.params.id);
    if (!ok) throw new NotFoundError('Coupon');
    res.json(success(null, 'Coupon deleted.'));
  },

  // ---- Analytics ----
  analytics: async (_req: Request, res: Response) => {
    const { AnalyticsService } = await import('../services/order.service');
    const summary = await AnalyticsService.summary();
    const [topProducts, lowStock] = await Promise.all([
      AnalyticsService.topProducts(5),
      AnalyticsService.lowStock(),
    ]);
    res.json(success({ summary, topProducts, lowStock }));
  },
};
