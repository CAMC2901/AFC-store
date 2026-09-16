import { prisma } from '../../config/prisma';
import { Testimonial } from '../../types';
import { ITestimonialRepository } from '../types';
import { InMemoryTestimonialRepository } from '../index';

export class PrismaTestimonialRepository implements ITestimonialRepository {
  private fallback = new InMemoryTestimonialRepository();

  async findAll(): Promise<Testimonial[]> {
    try {
      const items = await prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return items.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role ?? undefined,
        content: t.content,
        rating: t.rating,
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : t.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[Prisma Testimonial DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findAll();
    }
  }
}

