import { repositories } from '../repositories/container';
import { CartService } from './cart.service';
import { NotFoundError } from '../utils/error';
import { Order, OrderContact, OrderAddress } from '../types';
import { round2 } from '../utils/helpers';

export interface CheckoutInput {
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  contact: OrderContact;
  couponCode?: string;
  shippingMethod?: 'standard' | 'express';
}

export interface CheckoutResult {
  order: Order;
}

export const OrderService = {
  /**
   * Creates an order from the user's current cart, applying a coupon if valid
   * and atomically decrementing stock.
   */
  async checkout(userId: string, input: CheckoutInput): Promise<CheckoutResult> {
    const { lines, totals } = await CartService.totals(
      userId,
      input.couponCode,
      input.shippingMethod ?? 'standard'
    );

    if (lines.length === 0) {
      throw new NotFoundError('Cart is empty — add items before checking out.');
    }

    for (const line of lines) {
      if (line.quantity > line.stock) {
        throw new NotFoundError(`Insufficient stock for "${line.name}".`);
      }
    }

    const order = await repositories.orders.create({
      userId,
      items: lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        image: l.image,
        sku: '',
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        subtotal: l.subtotal,
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      couponCode: totals.couponCode,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      contact: input.contact,
    });

    for (const line of lines) {
      await repositories.products.adjustStock(line.productId, -line.quantity);
    }
    if (totals.couponCode) {
      await repositories.coupons.incrementUsage(totals.couponCode);
    }
    await repositories.carts.clearCart(userId);

    return { order };
  },

  async getById(orderId: string, userId?: string): Promise<Order> {
    const order = await repositories.orders.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    if (userId && order.userId !== userId) throw new NotFoundError('Order');
    return order;
  },

  async listForUser(userId: string, page = 1, limit = 10) {
    return repositories.orders.findByUser(userId, page, limit);
  },

  async listAll(page = 1, limit = 10, status?: string) {
    return repositories.orders.findAll(page, limit, status);
  },

  async updateStatus(orderId: string, status: string): Promise<Order> {
    const order = await repositories.orders.updateStatus(orderId, status);
    if (!order) throw new NotFoundError('Order');
    return order;
  },

  async updatePaymentStatus(orderId: string, status: string): Promise<Order> {
    const order = await repositories.orders.updatePaymentStatus(orderId, status);
    if (!order) throw new NotFoundError('Order');
    return order;
  },

  /** Estimate totals without creating the order (checkout review step). */
  async estimate(userId: string, input: Omit<CheckoutInput, 'shippingAddress' | 'billingAddress' | 'contact'>) {
    const { totals } = await CartService.totals(userId, input.couponCode, input.shippingMethod ?? 'standard');
    return totals;
  },
};

export const AnalyticsService = {
  async summary() {
    const [totalOrders, totalRevenue, totalCustomers, totalProducts, ordersByStatus, recentOrders] =
      await Promise.all([
        repositories.orders.count(),
        repositories.orders.revenue(),
        repositories.users.count(),
        repositories.products.count(),
        repositories.orders.ordersByStatus(),
        repositories.orders.recent(5),
      ]);

    return {
      totalOrders,
      totalRevenue: round2(totalRevenue),
      totalCustomers,
      totalProducts,
      ordersByStatus,
      recentOrders,
    };
  },

  async topProducts(limit = 5) {
    return repositories.products.topSelling(limit);
  },

  async lowStock(threshold = 10) {
    const { items } = await repositories.products.findAll({ limit: 100 });
    return items.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
  },
};
