'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductsApi } from '@/services/products';
import type { ProductQuery } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  list: (query: ProductQuery) => [...productKeys.all, query] as const,
  detail: (slug: string) => ['products', slug] as const,
  featured: ['products', 'featured'] as const,
  bestsellers: ['products', 'bestsellers'] as const,
  categories: ['categories'] as const,
  priceRange: ['products', 'price-range'] as const,
};

export function useProducts(query: ProductQuery, enabled = true) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => ProductsApi.list(query),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => ProductsApi.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useFeaturedProducts() {
  return useQuery({ queryKey: productKeys.featured, queryFn: ProductsApi.featured });
}

export function useBestsellers() {
  return useQuery({ queryKey: productKeys.bestsellers, queryFn: ProductsApi.bestsellers });
}

export function useCategories() {
  return useQuery({ queryKey: productKeys.categories, queryFn: ProductsApi.categories });
}

export function usePriceRange() {
  return useQuery({ queryKey: productKeys.priceRange, queryFn: ProductsApi.priceRange });
}

/** Resolve a set of product ids into full products (for the comparison view). */
export function useCompareProducts(ids: string[]) {
  return useQuery({
    queryKey: ['products', 'compare', ids],
    queryFn: async () => {
      const { items } = await ProductsApi.list({ limit: 100 });
      const byId = new Map(items.map((p) => [p.id, p]));
      return ids.map((id) => byId.get(id)).filter((p): p is import('@/types').Product => Boolean(p));
    },
    enabled: ids.length > 0,
    placeholderData: (prev) => prev,
  });
}
