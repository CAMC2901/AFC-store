import { Request, Response } from 'express';
import { ProductService, CategoryService } from '../services/product.service';
import { success } from '../utils/error';
import { ProductFilters } from '../types';

export const ProductController = {
  list: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const filters: ProductFilters = {
      search: q.search as string | undefined,
      categorySlug: q.category as string | undefined,
      minPrice: q.minPrice !== undefined ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice !== undefined ? Number(q.maxPrice) : undefined,
      brand: q.brand as string | undefined,
      material: q.material as string | undefined,
      color: q.color as string | undefined,
      inStockOnly: q.inStock === 'true',
      featuredOnly: q.featured === 'true',
      sortBy: q.sortBy as ProductFilters['sortBy'],
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 12),
    };
    const result = await ProductService.list(filters);
    res.json(success(result));
  },

  getBySlug: async (req: Request, res: Response) => {
    const product = await ProductService.getBySlug(req.params.slug);
    const related = await ProductService.related(product);
    res.json(success({ product, related }));
  },

  featured: async (_req: Request, res: Response) => {
    const items = await ProductService.featured(8);
    res.json(success(items));
  },

  bestsellers: async (_req: Request, res: Response) => {
    const items = await ProductService.bestsellers(8);
    res.json(success(items));
  },

  priceRange: async (_req: Request, res: Response) => {
    const range = await ProductService.priceRange();
    res.json(success(range));
  },

  categories: async (_req: Request, res: Response) => {
    const categories = await CategoryService.list();
    res.json(success(categories));
  },
};

export const CategoryController = {
  list: ProductController.categories,
};
