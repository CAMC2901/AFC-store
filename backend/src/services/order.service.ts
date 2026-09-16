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

interface TopSaleAgg {
  productId: string;
  name: string;
  nameEn?: string;
  image: string;
  units: number;
  revenue: number;
}

/** Orders created within the last `days` days (inclusive of today). */
async function ordersSince(days: number): Promise<Order[]> {
  if (days <= 0) return (await repositories.orders.all()).slice();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  cutoff.setUTCHours(0, 0, 0, 0);
  const all = await repositories.orders.all();
  return all.filter((o) => new Date(o.createdAt).getTime() >= cutoff.getTime());
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

    const reservedProducts: Array<{ productId: string; quantity: number }> = [];

    try {
      for (const line of lines) {
        if (line.quantity > line.stock) {
          throw new NotFoundError(`Stock insuficiente para "${line.name}".`);
        }
        const updated = await repositories.products.adjustStock(line.productId, -line.quantity);
        if (!updated) {
          throw new NotFoundError(`El producto "${line.name}" ya no cuenta con stock suficiente.`);
        }
        reservedProducts.push({ productId: line.productId, quantity: line.quantity });
      }

      const order = await repositories.orders.create({
        userId,
        items: lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          nameEn: l.nameEn,
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
        billingAddress: input.billingAddress ?? input.shippingAddress,
        contact: input.contact,
      });

      if (totals.couponCode) {
        await repositories.coupons.incrementUsage(totals.couponCode, userId);
      }
      await repositories.carts.clearCart(userId);

      return { order };
    } catch (err) {
      // Rollback reserved stock in case of transaction failure
      for (const reserved of reservedProducts) {
        await repositories.products.adjustStock(reserved.productId, reserved.quantity);
      }
      throw err;
    }
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

  /**
   * Daily revenue series for the last `days` days (or one point per day),
   * zero-filled so the area chart is continuous.
   */
  async revenueSeries(days = 30) {
    const validOrders = (await ordersSince(days)).filter((o) => o.status !== 'CANCELLED');
    const bucket = new Map<string, { total: number; orders: number }>();
    for (const order of validOrders) {
      const key = order.createdAt.slice(0, 10);
      const current = bucket.get(key) ?? { total: 0, orders: 0 };
      current.total += order.total;
      current.orders += 1;
      bucket.set(key, current);
    }

    const now = new Date();
    const series = [];
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const day = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset)
      );
      const key = day.toISOString().slice(0, 10);
      const point = bucket.get(key) ?? { total: 0, orders: 0 };
      series.push({ date: key, total: round2(point.total), orders: point.orders });
    }
    return series;
  },

  /** Revenue grouped by product category, counting an order once per category. */
  async revenueByCategory(days = 90) {
    const validOrders = (await ordersSince(days)).filter((o) => o.status !== 'CANCELLED');
    const productIds = Array.from(new Set(validOrders.flatMap((o) => o.items.map((i) => i.productId))));
    const products = await repositories.products.findByIds(productIds);
    const productById = new Map(products.map((p) => [p.id, p]));

    const agg = new Map<
      string,
      { category: string; name: string; nameEn?: string; total: number; orders: Set<string> }
    >();
    for (const order of validOrders) {
      for (const item of order.items) {
        const product = productById.get(item.productId);
        const key = product?.categoryId ?? 'other';
        const current = agg.get(key) ?? {
          category: key,
          name: product?.categoryName ?? 'Otros',
          nameEn: product?.categoryNameEn,
          total: 0,
          orders: new Set<string>(),
        };
        current.total += item.subtotal;
        current.orders.add(order.id);
        agg.set(key, current);
      }
    }

    return Array.from(agg.values()).map((entry) => ({
      category: entry.category,
      name: entry.name,
      nameEn: entry.nameEn,
      total: round2(entry.total),
      orders: entry.orders.size,
    }));
  },

  /** Top products by accumulated line revenue from completed orders. */
  async topSellingByRevenue(limit = 5, days = 90) {
    return topSelling(limit, days, (a, b) => b.revenue - a.revenue);
  },

  /** Top products by units sold from completed orders. */
  async topSellingByUnits(limit = 5, days = 90) {
    return topSelling(limit, days, (a, b) => b.units - a.units || b.revenue - a.revenue);
  },
};

/** Aggregate line sales and sort by a comparator. */
async function topSelling(
  limit: number,
  days: number,
  cmp: (a: TopSaleAgg, b: TopSaleAgg) => number
) {
  const validOrders = (await ordersSince(days)).filter((o) => o.status !== 'CANCELLED');
  const agg = new Map<string, TopSaleAgg>();
  for (const order of validOrders) {
    for (const item of order.items) {
      const current = agg.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        nameEn: item.nameEn,
        image: item.image,
        units: 0,
        revenue: 0,
      };
      current.units += item.quantity;
      current.revenue += item.subtotal;
      agg.set(item.productId, current);
    }
  }

  return Array.from(agg.values())
    .sort(cmp)
    .slice(0, limit)
    .map((entry) => ({ ...entry, revenue: round2(entry.revenue) }));
}
