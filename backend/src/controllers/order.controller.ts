import { Request, Response } from 'express';
import { OrderService, AnalyticsService } from '../services/order.service';
import { WishlistService } from '../services/wishlist.service';
import { success } from '../utils/error';

export const OrderController = {
  checkout: async (req: Request, res: Response) => {
    const input = req.body as Parameters<typeof OrderService.checkout>[1];
    const { order } = await OrderService.checkout(req.userId!, input);
    res.status(201).json(success({ order }, 'Order placed successfully.'));
  },

  estimate: async (req: Request, res: Response) => {
    const input = req.body as { couponCode?: string; shippingMethod?: 'standard' | 'express' };
    const totals = await OrderService.estimate(req.userId!, input);
    res.json(success(totals));
  },

  getById: async (req: Request, res: Response) => {
    const order = await OrderService.getById(req.params.id, req.userId);
    res.json(success({ order }));
  },

  myOrders: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await OrderService.listForUser(req.userId!, page, limit);
    res.json(success(result));
  },

  listAll: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = req.query.status as string | undefined;
    const result = await OrderService.listAll(page, limit, status);
    res.json(success(result));
  },

  updateStatus: async (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    const order = await OrderService.updateStatus(req.params.id, status);
    res.json(success({ order }, 'Order status updated.'));
  },

  updatePaymentStatus: async (req: Request, res: Response) => {
    const { paymentStatus } = req.body as { paymentStatus: string };
    const order = await OrderService.updatePaymentStatus(req.params.id, paymentStatus);
    res.json(success({ order }, 'Payment status updated.'));
  },
};

export const WishlistController = {
  list: async (req: Request, res: Response) => {
    const products = await WishlistService.list(req.userId!);
    res.json(success(products));
  },

  toggle: async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const result = await WishlistService.toggle(req.userId!, productId);
    res.json(
      success(result, result.added ? 'Added to wishlist.' : 'Removed from wishlist.')
    );
  },

  remove: async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const products = await WishlistService.remove(req.userId!, productId);
    res.json(success(products, 'Removed from wishlist.'));
  },
};

export const AnalyticsController = {
  summary: async (_req: Request, res: Response) => {
    const summary = await AnalyticsService.summary();
    res.json(success(summary));
  },

  topProducts: async (_req: Request, res: Response) => {
    const products = await AnalyticsService.topProducts(5);
    res.json(success(products));
  },

  lowStock: async (_req: Request, res: Response) => {
    const products = await AnalyticsService.lowStock();
    res.json(success(products));
  },
};
