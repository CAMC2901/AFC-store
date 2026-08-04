import { apiClient } from '@/lib/api-client';
import type { Category, Paginated, Product, ProductQuery } from '@/types';

interface ProductDetailData {
  product: Product;
  related: Product[];
}

export const ProductsApi = {
  async list(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const { data } = await apiClient.get<{ data: Paginated<Product> }>('/products', {
      params: { ...query, limit: query.limit ?? 12 },
    });
    return data.data;
  },

  async getBySlug(slug: string): Promise<ProductDetailData> {
    const { data } = await apiClient.get<{ data: ProductDetailData }>(`/products/${slug}`);
    return data.data;
  },

  async featured(): Promise<Product[]> {
    const { data } = await apiClient.get<{ data: Product[] }>('/products/featured');
    return data.data;
  },

  async bestsellers(): Promise<Product[]> {
    const { data } = await apiClient.get<{ data: Product[] }>('/products/bestsellers');
    return data.data;
  },

  async categories(): Promise<Category[]> {
    const { data } = await apiClient.get<{ data: Category[] }>('/products/categories');
    return data.data;
  },

  async priceRange(): Promise<{ min: number; max: number }> {
    const { data } = await apiClient.get<{ data: { min: number; max: number } }>('/products/price-range');
    return data.data;
  },
};

export const MiscApi = {
  async testimonials() {
    const { data } = await apiClient.get<{ data: import('@/types').Testimonial[] }>('/testimonials');
    return data.data;
  },

  async subscribeNewsletter(email: string): Promise<string> {
    const { data } = await apiClient.post<{ data: { email: string } }>('/newsletter', { email });
    return data.data.email;
  },

  async sendContact(payload: { name: string; email: string; subject: string; message: string }) {
    const { data } = await apiClient.post('/contact', payload);
    return data.data;
  },
};
