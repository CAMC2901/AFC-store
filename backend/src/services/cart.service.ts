import { repositories } from '../repositories/container';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, EXPRESS_SHIPPING_FEE, TAX_RATE } from '../constants';
import { NotFoundError } from '../utils/error';
import { round2 } from '../utils/helpers';

export interface CartLineInput {
  productId: string;
  quantity: number;
}

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  freeShippingEligible: boolean;
}

export type ShippingMethod = 'standard' | 'express';

export const CartService = {
  /** Resolves stored line items into hydrated product lines. */
  async hydrate(userId: string): Promise<CartLine[]> {
    const stored = await repositories.carts.getCart(userId);
    const lines: CartLine[] = [];
    for (const item of stored) {
      const product = await repositories.products.findById(item.productId);
      if (!product || !product.isActive) continue;
      lines.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? '',
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: round2(product.price * item.quantity),
        stock: product.stock,
      });
    }
    return lines;
  },

  async addItem(userId: string, productId: string, quantity = 1): Promise<CartLine[]> {
    const product = await repositories.products.findById(productId);
    if (!product || !product.isActive) throw new NotFoundError('Product');

    const items = await repositories.carts.getCart(userId);
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, Math.max(product.stock, 1));
    } else {
      items.push({ productId, quantity: Math.max(1, quantity) });
    }
    await repositories.carts.saveCart(userId, items);
    return this.hydrate(userId);
  },

  async updateItem(userId: string, productId: string, quantity: number): Promise<CartLine[]> {
    const items = await repositories.carts.getCart(userId);
    const line = items.find((i) => i.productId === productId);
    if (!line) throw new NotFoundError('Cart item');
    line.quantity = Math.max(1, quantity);
    await repositories.carts.saveCart(userId, items);
    return this.hydrate(userId);
  },

  async removeItem(userId: string, productId: string): Promise<CartLine[]> {
    let items = await repositories.carts.getCart(userId);
    items = items.filter((i) => i.productId !== productId);
    await repositories.carts.saveCart(userId, items);
    return this.hydrate(userId);
  },

  async clear(userId: string): Promise<void> {
    await repositories.carts.clearCart(userId);
  },

  async count(userId: string): Promise<number> {
    const stored = await repositories.carts.getCart(userId);
    return stored.reduce((sum, i) => sum + i.quantity, 0);
  },

  /** Computes totals; optionally applies a coupon and shipping method. */
  async totals(
    userId: string,
    couponCode?: string,
    shippingMethod: ShippingMethod = 'standard'
  ): Promise<{ lines: CartLine[]; totals: CartTotals }> {
    const lines = await this.hydrate(userId);
    const subtotal = round2(lines.reduce((sum, l) => sum + l.subtotal, 0));

    let discount = 0;
    if (couponCode) {
      const coupon = await repositories.coupons.validate(couponCode, subtotal);
      if (coupon) {
        discount =
          coupon.type === 'PERCENTAGE'
            ? round2((subtotal * coupon.value) / 100)
            : coupon.value;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    const freeShippingEligible = subtotal - discount >= FREE_SHIPPING_THRESHOLD;
    const baseFee = shippingMethod === 'express' ? EXPRESS_SHIPPING_FEE : STANDARD_SHIPPING_FEE;
    const shipping = lines.length === 0 || freeShippingEligible ? 0 : baseFee;

    const taxable = Math.max(0, subtotal - discount);
    const tax = round2(taxable * TAX_RATE);
    const total = round2(taxable + shipping + tax);

    return {
      lines,
      totals: {
        subtotal,
        shipping,
        discount,
        tax,
        total,
        couponCode: discount > 0 ? couponCode : undefined,
        freeShippingEligible,
      },
    };
  },

  /** Validate a coupon in isolation (for the coupon field UX). */
  async validateCoupon(code: string, subtotal: number) {
    const coupon = await repositories.coupons.validate(code, subtotal);
    if (!coupon) {
      throw new NotFoundError('Coupon');
    }
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount:
        coupon.type === 'PERCENTAGE'
          ? round2((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal),
      maxDiscount: coupon.maxDiscount,
    };
  },
};
