import { prisma } from '../../config/prisma';
import { PaginatedResult, Product, ProductFilters } from '../../types';
import { IProductRepository } from '../types';
import { clamp, slugify, toNumber } from '../../utils/helpers';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { InMemoryProductRepository } from '../index';

const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  nameEn: p.nameEn ?? undefined,
  slug: p.slug,
  description: p.description,
  descriptionEn: p.descriptionEn ?? undefined,
  longDescription: p.longDescription ?? undefined,
  longDescriptionEn: p.longDescriptionEn ?? undefined,
  categoryId: p.categoryId,
  categorySlug: p.category?.slug ?? 'decor',
  categoryName: p.category?.name ?? 'Decor',
  categoryNameEn: undefined,
  brand: p.brand,
  price: p.price,
  compareAtPrice: p.compareAtPrice ?? undefined,
  images: p.images ?? [],
  sku: p.sku,
  stock: p.stock,
  material: p.material ?? undefined,
  materialEn: p.materialEn ?? undefined,
  color: p.color ?? undefined,
  colorEn: p.colorEn ?? undefined,
  dimensions: p.dimensions ?? undefined,
  weight: p.weight ?? undefined,
  featured: p.featured,
  isActive: p.isActive,
  rating: p.rating,
  reviewCount: p.reviewCount,
  tags: p.tags ?? [],
  tagsEn: p.tagsEn ?? undefined,
  createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
  updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : p.updatedAt.toISOString(),
});

export class PrismaProductRepository implements IProductRepository {
  private fallback = new InMemoryProductRepository();

  async findById(id: string): Promise<Product | null> {
    try {
      const p = await (prisma as any).product.findUnique({
        where: { id },
        include: { category: true },
      });
      return p ? mapProduct(p) : null;
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findById(id);
    }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    try {
      const p = await (prisma as any).product.findUnique({
        where: { slug },
        include: { category: true },
      });
      return p ? mapProduct(p) : null;
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findBySlug(slug);
    }
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    try {
      const items = await (prisma as any).product.findMany({
        where: { id: { in: ids }, isActive: true },
        include: { category: true },
      });
      return items.map(mapProduct);
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findByIds(ids);
    }
  }

  async findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    try {
      const where: any = { isActive: true };

      if (filters.search) {
        const q = filters.search.replace(/[^a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ]/g, '').trim().slice(0, 100);
        if (q.length > 0) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { descriptionEn: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { material: { contains: q, mode: 'insensitive' } },
          { color: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ];
        }
      }
      if (filters.categorySlug) {
        where.category = { slug: filters.categorySlug };
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        };
      }
      if (filters.brand) where.brand = { equals: filters.brand, mode: 'insensitive' };
      if (filters.material) where.material = { contains: filters.material, mode: 'insensitive' };
      if (filters.color) where.color = { contains: filters.color, mode: 'insensitive' };
      if (filters.inStockOnly) where.stock = { gt: 0 };
      if (filters.featuredOnly) where.featured = true;

      let orderBy: any = { createdAt: 'desc' };
      switch (filters.sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        case 'popularity':
          orderBy = { reviewCount: 'desc' };
          break;
        default:
          break;
      }

      const page = clamp(toNumber(filters.page, 1), 1, Number.MAX_SAFE_INTEGER);
      const limit = clamp(toNumber(filters.limit, DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
      const total = await (prisma as any).product.count({ where });
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const items = await (prisma as any).product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      });

      return {
        items: items.map(mapProduct),
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      };
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findAll(filters);
    }
  }

  async findRelated(product: Product, limit = 4): Promise<Product[]> {
    try {
      const items = await (prisma as any).product.findMany({
        where: {
          id: { not: product.id },
          isActive: true,
          categoryId: product.categoryId,
        },
        take: limit,
        orderBy: { rating: 'desc' },
        include: { category: true },
      });
      return items.map(mapProduct);
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.findRelated(product, limit);
    }
  }

  async create(input: Partial<Product>): Promise<Product> {
    try {
      const name = input.name ?? 'Untitled';
      const slug = input.slug ?? slugify(name);
      const p = await (prisma as any).product.create({
        data: {
          name,
          slug,
          description: input.description ?? '',
          categoryId: input.categoryId ?? 'cat_decor',
          brand: input.brand ?? 'AFC Studio',
          price: input.price ?? 0,
          images: input.images ?? [],
          sku: input.sku ?? `SKU_${Date.now()}`,
          stock: input.stock ?? 0,
          material: input.material,
          color: input.color,
          dimensions: input.dimensions ? (input.dimensions as any) : undefined,
          weight: input.weight,
          featured: input.featured ?? false,
          isActive: input.isActive ?? true,
        },
        include: { category: true },
      });
      return mapProduct(p);
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.create(input);
    }
  }

  async update(id: string, input: Partial<Product>): Promise<Product | null> {
    try {
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.nameEn !== undefined) data.nameEn = input.nameEn;
      if (input.slug !== undefined) data.slug = input.slug;
      if (input.description !== undefined) data.description = input.description;
      if (input.descriptionEn !== undefined) data.descriptionEn = input.descriptionEn;
      if (input.longDescription !== undefined) data.longDescription = input.longDescription;
      if (input.longDescriptionEn !== undefined) data.longDescriptionEn = input.longDescriptionEn;
      if (input.categoryId !== undefined) data.categoryId = input.categoryId;
      if (input.brand !== undefined) data.brand = input.brand;
      if (input.price !== undefined) data.price = input.price;
      if (input.compareAtPrice !== undefined) data.compareAtPrice = input.compareAtPrice;
      if (input.images !== undefined) data.images = input.images;
      if (input.sku !== undefined) data.sku = input.sku;
      if (input.stock !== undefined) data.stock = input.stock;
      if (input.material !== undefined) data.material = input.material;
      if (input.materialEn !== undefined) data.materialEn = input.materialEn;
      if (input.color !== undefined) data.color = input.color;
      if (input.colorEn !== undefined) data.colorEn = input.colorEn;
      if (input.dimensions !== undefined) data.dimensions = input.dimensions;
      if (input.weight !== undefined) data.weight = input.weight;
      if (input.featured !== undefined) data.featured = input.featured;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.rating !== undefined) data.rating = input.rating;
      if (input.reviewCount !== undefined) data.reviewCount = input.reviewCount;
      if (input.tags !== undefined) data.tags = input.tags;
      if (input.tagsEn !== undefined) data.tagsEn = input.tagsEn;

      const p = await (prisma as any).product.update({
        where: { id },
        data,
        include: { category: true },
      });
      return p ? mapProduct(p) : null;
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.update(id, input);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await (prisma as any).product.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.delete(id);
    }
  }

  async adjustStock(id: string, delta: number): Promise<Product | null> {
    try {
      const product = await this.findById(id);
      if (!product) return null;
      if (delta < 0 && product.stock + delta < 0) return null;

      const p = await (prisma as any).product.update({
        where: { id },
        data: { stock: product.stock + delta },
        include: { category: true },
      });
      return p ? mapProduct(p) : null;
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.adjustStock(id, delta);
    }
  }

  async addRating(id: string, rating: number): Promise<Product | null> {
    try {
      const product = await this.findById(id);
      if (!product) return null;
      const count = Math.max(0, product.reviewCount || 0);
      const currentRating = Math.max(0, product.rating || 0);
      const currentTotal = currentRating * count;
      const newCount = count + 1;
      const rawRating = (currentTotal + rating) / newCount;
      const newRating = Math.min(5, Math.max(1, Math.round(rawRating * 10) / 10));

      const p = await (prisma as any).product.update({
        where: { id },
        data: { rating: newRating, reviewCount: newCount },
        include: { category: true },
      });
      return p ? mapProduct(p) : null;
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.addRating(id, rating);
    }
  }

  async count(): Promise<number> {
    try {
      return (prisma as any).product.count({ where: { isActive: true } });
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.count();
    }
  }

  async minMaxPrice(): Promise<{ min: number; max: number }> {
    try {
      const agg = await (prisma as any).product.aggregate({
        where: { isActive: true },
        _min: { price: true },
        _max: { price: true },
      });
      return { min: agg._min?.price ?? 0, max: agg._max?.price ?? 10000000 };
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.minMaxPrice();
    }
  }

  async topSelling(limit: number): Promise<Product[]> {
    try {
      const items = await (prisma as any).product.findMany({
        where: { isActive: true },
        orderBy: { reviewCount: 'desc' },
        take: limit,
        include: { category: true },
      });
      return items.map(mapProduct);
    } catch (err) {
      console.warn('[Prisma Product DB Warning] Fallback to in-memory:', (err as Error)?.message?.slice(0, 80));
      return this.fallback.topSelling(limit);
    }
  }
}

