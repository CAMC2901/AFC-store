import { prisma } from '../../config/prisma';
import { Coupon } from '../../types';
import { CreateCouponInput, ICouponRepository } from '../types';

const mapCoupon = (c: any): Coupon => ({
  id: c.id,
  code: c.code,
  type: c.type as 'PERCENTAGE' | 'FIXED',
  value: c.value,
  minSubtotal: c.minSubtotal,
  maxDiscount: c.maxDiscount ?? undefined,
  expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
  isActive: c.isActive,
  usageLimit: c.usageLimit ?? undefined,
  usedCount: c.usedCount,
});

export class PrismaCouponRepository implements ICouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    try {
      const c = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });
      return c ? mapCoupon(c) : null;
    } catch (err) {
      console.warn('[Prisma Coupon DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return new (require('../index').InMemoryCouponRepository)().findByCode(code);
    }
  }

  async findAll(): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      orderBy: { code: 'asc' },
    });
    return coupons.map(mapCoupon);
  }

  async create(input: CreateCouponInput): Promise<Coupon> {
    const c = await prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        type: input.type,
        value: input.value,
        minSubtotal: input.minSubtotal ?? 0,
        maxDiscount: input.maxDiscount,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive ?? true,
        usageLimit: input.usageLimit,
      },
    });
    return mapCoupon(c);
  }

  async update(id: string, input: Partial<Coupon>): Promise<Coupon | null> {
    const c = await prisma.coupon.update({
      where: { id },
      data: {
        ...(input.code && { code: input.code.toUpperCase() }),
        ...(input.type && { type: input.type }),
        ...(input.value !== undefined && { value: input.value }),
        ...(input.minSubtotal !== undefined && { minSubtotal: input.minSubtotal }),
        ...(input.maxDiscount !== undefined && { maxDiscount: input.maxDiscount }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }),
      },
    });
    return c ? mapCoupon(c) : null;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.coupon.delete({ where: { id } });
    return true;
  }

  async incrementUsage(code: string, userId?: string): Promise<void> {
    const coupon = await this.findByCode(code);
    if (!coupon) return;

    await prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });

      if (userId) {
        await tx.couponUsage.create({
          data: {
            userId,
            couponId: coupon.id,
          },
        });
      }
    });
  }

  async validate(code: string, subtotal: number, userId?: string): Promise<Coupon | null> {
    const coupon = await this.findByCode(code);
    if (!coupon || !coupon.isActive) return null;

    if (subtotal < coupon.minSubtotal) return null;

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return null;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return null;
    }

    if (userId) {
      const used = await this.hasUserUsed(code, userId);
      if (used) return null;
    }

    return coupon;
  }

  async hasUserUsed(code: string, userId: string): Promise<boolean> {
    const coupon = await this.findByCode(code);
    if (!coupon) return false;

    const count = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    return count > 0;
  }
}

