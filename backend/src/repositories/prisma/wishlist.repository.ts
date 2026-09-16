import { prisma } from '../../config/prisma';
import { WishlistItem } from '../../types';
import { IWishlistRepository } from '../types';

export class PrismaWishlistRepository implements IWishlistRepository {
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((w) => ({
      userId: w.userId,
      productId: w.productId,
      addedAt: typeof w.createdAt === 'string' ? w.createdAt : w.createdAt.toISOString(),
    }));
  }

  async add(userId: string, productId: string): Promise<WishlistItem[]> {
    await prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    return this.getWishlist(userId);
  }

  async remove(userId: string, productId: string): Promise<WishlistItem[]> {
    await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
    return this.getWishlist(userId);
  }

  async has(userId: string, productId: string): Promise<boolean> {
    const count = await prisma.wishlist.count({
      where: { userId, productId },
    });
    return count > 0;
  }
}

