import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { success } from '../utils/error';

export const CartController = {
  get: async (req: Request, res: Response) => {
    const lines = await CartService.hydrate(req.userId!);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
    res.json(success({ lines, count, subtotal }));
  },

  add: async (req: Request, res: Response) => {
    const { productId, quantity } = req.body as { productId: string; quantity: number };
    const lines = await CartService.addItem(req.userId!, productId, quantity);
    const count = await CartService.count(req.userId!);
    res.status(201).json(success({ lines, count }, 'Item added to cart.'));
  },

  update: async (req: Request, res: Response) => {
    const { productId, quantity } = req.body as { productId: string; quantity: number };
    const lines = await CartService.updateItem(req.userId!, productId, quantity);
    res.json(success({ lines }, 'Cart updated.'));
  },

  remove: async (req: Request, res: Response) => {
    const { productId } = req.body as { productId: string };
    const lines = await CartService.removeItem(req.userId!, productId);
    res.json(success({ lines }, 'Item removed from cart.'));
  },

  clear: async (req: Request, res: Response) => {
    await CartService.clear(req.userId!);
    res.json(success({ lines: [] }, 'Cart cleared.'));
  },

  totals: async (req: Request, res: Response) => {
    const couponCode = (req.body?.couponCode as string | undefined) || undefined;
    const shippingMethod = (req.body?.shippingMethod as 'standard' | 'express') || 'standard';
    const result = await CartService.totals(req.userId!, couponCode, shippingMethod);
    res.json(success(result.totals));
  },

  validateCoupon: async (req: Request, res: Response) => {
    const { code, subtotal } = req.body as { code: string; subtotal: number };
    const result = await CartService.validateCoupon(code, subtotal);
    res.json(success(result));
  },
};
