import { repositories } from '../repositories/container';
import { PaginatedResult, Product, ProductFilters } from '../types';
import { NotFoundError } from '../utils/error';

export const ProductService = {
  async list(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    return repositories.products.findAll(filters);
  },

  async getBySlug(slugOrId: string): Promise<Product> {
    let product = await repositories.products.findBySlug(slugOrId);
    if (!product) {
      product = await repositories.products.findById(slugOrId);
    }
    if (!product || !product.isActive) throw new NotFoundError('Product');
    return product;
  },

  async getById(id: string): Promise<Product> {
    const product = await repositories.products.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  async related(product: Product, limit = 4): Promise<Product[]> {
    return repositories.products.findRelated(product, limit);
  },

  async featured(limit = 8): Promise<Product[]> {
    const result = await repositories.products.findAll({ featuredOnly: true, limit, sortBy: 'rating' });
    return result.items;
  },

  async bestsellers(limit = 8): Promise<Product[]> {
    return repositories.products.topSelling(limit);
  },

  async priceRange(): Promise<{ min: number; max: number }> {
    return repositories.products.minMaxPrice();
  },

  async create(input: Partial<Product>): Promise<Product> {
    return repositories.products.create(input);
  },

  async update(id: string, input: Partial<Product>): Promise<Product> {
    const updated = await repositories.products.update(id, input);
    if (!updated) throw new NotFoundError('Product');
    return updated;
  },

  async remove(id: string): Promise<void> {
    const ok = await repositories.products.delete(id);
    if (!ok) throw new NotFoundError('Product');
  },

  async adjustStock(id: string, delta: number): Promise<Product> {
    const product = await repositories.products.adjustStock(id, delta);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  async addRating(id: string, rating: number): Promise<Product> {
    const product = await repositories.products.addRating(id, rating);
    if (!product) throw new NotFoundError('Product');
    return product;
  },
};

export const CategoryService = {
  async list() {
    const categories = await repositories.categories.findAll();
    const counts = await Promise.all(
      categories.map(async (c) => {
        const { pagination } = await repositories.products.findAll({
          categorySlug: c.slug,
          page: 1,
          limit: 1,
        });
        return { ...c, productCount: pagination.total };
      })
    );
    return counts;
  },

  async getBySlug(slug: string) {
    const category = await repositories.categories.findBySlug(slug);
    if (!category) throw new NotFoundError('Category');
    return category;
  },
};
