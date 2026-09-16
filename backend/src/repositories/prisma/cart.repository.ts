import { prisma } from '../../config/prisma';
import { ICartRepository } from '../types';

export class PrismaCartRepository implements ICartRepository {
  async getCart(userId: string): Promise<Array<{ productId: string; quantity: number }>> {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
  }

  async saveCart(userId: string, items: Array<{ productId: string; quantity: number }>): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId } });
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item) => ({
            userId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }
    });
  }

  async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { userId } });
  }
}

