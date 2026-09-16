import { prisma } from '../../config/prisma';
import { Order, PaginatedResult } from '../../types';
import { CreateOrderInput, IOrderRepository } from '../types';

const mapOrder = (o: any): Order => ({
  id: o.id,
  userId: o.userId,
  items: (o.items ?? []).map((i: any) => ({
    productId: i.productId,
    name: i.name,
    nameEn: i.nameEn ?? undefined,
    image: i.image,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    subtotal: i.subtotal,
  })),
  subtotal: o.subtotal,
  shipping: o.shipping,
  discount: o.discount,
  tax: o.tax,
  total: o.total,
  couponCode: o.couponCode ?? undefined,
  status: o.status,
  paymentStatus: o.paymentStatus,
  shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress,
  billingAddress: typeof o.billingAddress === 'string' ? JSON.parse(o.billingAddress) : o.billingAddress,
  contact: typeof o.contact === 'string' ? JSON.parse(o.contact) : o.contact,
  createdAt: typeof o.createdAt === 'string' ? o.createdAt : o.createdAt.toISOString(),
  updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : o.updatedAt.toISOString(),
});

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return o ? mapOrder(o) : null;
  }

  async findByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<Order>> {
    const total = await prisma.order.count({ where: { userId } });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const items = await prisma.order.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return {
      items: items.map(mapOrder),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findAll(page: number, limit: number, status?: string): Promise<PaginatedResult<Order>> {
    const where = status ? { status: status as any } : {};
    const total = await prisma.order.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const items = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return {
      items: items.map(mapOrder),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        userId: input.userId,
        subtotal: input.subtotal,
        shipping: input.shipping,
        discount: input.discount,
        tax: input.tax,
        total: input.total,
        couponCode: input.couponCode,
        shippingAddress: input.shippingAddress as any,
        billingAddress: input.billingAddress as any,
        contact: input.contact as any,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            nameEn: i.nameEn,
            image: i.image,
            sku: i.sku || `SKU_${i.productId}`,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { items: true },
    });
    return mapOrder(order);
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const o = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true },
    });
    return o ? mapOrder(o) : null;
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order | null> {
    const o = await prisma.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as any },
      include: { items: true },
    });
    return o ? mapOrder(o) : null;
  }

  async count(): Promise<number> {
    return prisma.order.count();
  }

  async revenue(): Promise<number> {
    const agg = await prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
    });
    return agg._sum.total ?? 0;
  }

  async ordersByStatus(): Promise<Array<{ status: string; count: number }>> {
    const grouped = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    return grouped.map((g) => ({ status: g.status, count: g._count.status }));
  }

  async recent(limit: number): Promise<Order[]> {
    const items = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return items.map(mapOrder);
  }

  async all(): Promise<Order[]> {
    const items = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return items.map(mapOrder);
  }
}

