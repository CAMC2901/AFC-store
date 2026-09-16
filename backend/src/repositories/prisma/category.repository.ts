import { prisma } from '../../config/prisma';
import { Category } from '../../types';
import { ICategoryRepository } from '../types';
import { slugify } from '../../utils/helpers';
import { InMemoryCategoryRepository } from '../index';

const mapCategory = (c: any): Category => ({
  id: c.id,
  name: c.name,
  nameEn: undefined,
  slug: c.slug,
  description: c.description ?? undefined,
  descriptionEn: undefined,
  imageUrl: c.imageUrl ?? undefined,
  productCount: c._count?.products ?? 0,
  sortOrder: c.sortOrder,
});

export class PrismaCategoryRepository implements ICategoryRepository {
  private fallback = new InMemoryCategoryRepository();

  async findById(id: string): Promise<Category | null> {
    try {
      const c = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });
      return c ? mapCategory(c) : null;
    } catch (err) {
      console.warn('[Prisma Category DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findById(id);
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const c = await prisma.category.findUnique({
        where: { slug },
        include: { _count: { select: { products: true } } },
      });
      return c ? mapCategory(c) : null;
    } catch (err) {
      console.warn('[Prisma Category DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findBySlug(slug);
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      });
      return categories.map(mapCategory);
    } catch (err) {
      console.warn('[Prisma Category DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findAll();
    }
  }

  async create(input: Partial<Category>): Promise<Category> {
    try {
      const name = input.name ?? 'New Category';
      const slug = input.slug ?? slugify(name);
      const c = await prisma.category.create({
        data: {
          name,
          slug,
          description: input.description,
          imageUrl: input.imageUrl,
          sortOrder: input.sortOrder ?? 0,
        },
        include: { _count: { select: { products: true } } },
      });
      return mapCategory(c);
    } catch (err) {
      console.warn('[Prisma Category DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.create(input);
    }
  }

  async update(id: string, input: Partial<Category>): Promise<Category | null> {
    try {
      const c = await prisma.category.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.slug && { slug: input.slug }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        },
        include: { _count: { select: { products: true } } },
      });
      return c ? mapCategory(c) : null;
    } catch (err) {
      console.warn('[Prisma Category DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.update(id, input);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[Prisma Category DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.delete(id);
    }
  }
}

