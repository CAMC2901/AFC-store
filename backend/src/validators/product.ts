import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, SORT_OPTIONS } from '../constants';

const id = z.string().min(1).max(64);

export const listProductsSchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().trim().max(80).optional(),
  material: z.string().trim().max(80).optional(),
  color: z.string().trim().max(80).optional(),
  inStock: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(SORT_OPTIONS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const productSlugSchema = z.object({
  slug: z.string().trim().min(1).max(160),
});

export const productIdSchema = z.object({
  productId: id,
});

export const dimensionsSchema = z
  .object({
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    depth: z.number().positive().optional(),
    assembly: z.string().trim().max(120).optional(),
    unit: z.enum(['in', 'cm']).default('in'),
  })
  .optional();

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  longDescription: z.string().trim().max(8000).optional(),
  categoryId: id,
  brand: z.string().trim().min(1).max(80).default('AFC Studio'),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  currency: z.string().trim().length(3).default('USD'),
  images: z.array(z.string().url()).min(1).default([]),
  sku: z.string().trim().min(1).max(40).optional(),
  stock: z.number().int().min(0).default(0),
  material: z.string().trim().max(120).optional(),
  color: z.string().trim().max(80).optional(),
  dimensions: dimensionsSchema,
  weight: z.number().positive().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const categorySlugSchema = z.object({
  slug: z.string().trim().min(1).max(120),
});

export const categoryIdSchema = z.object({
  id: z.string().min(1).max(64),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).default(99),
});

export const updateCategorySchema = createCategorySchema.partial();
