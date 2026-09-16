'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductsApi } from '@/services/products';
import type { ProductQuery } from '@/types';
import { localizeCategory, localizeProduct } from '@/i18n/localize';
import { useI18n } from '@/i18n';

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
  const { locale } = useI18n();
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => ProductsApi.list(query),
    enabled,
    placeholderData: (prev) => prev,
    select: (data) => ({
      ...data,
      items: data.items.map((p) => localizeProduct(p, locale)),
    }),
  });
}

export function useProduct(slug: string) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => ProductsApi.getBySlug(slug),
    enabled: Boolean(slug),
    select: (data) => ({
      product: localizeProduct(data.product, locale),
      related: data.related.map((p) => localizeProduct(p, locale)),
    }),
  });
}

export function useFeaturedProducts() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: productKeys.featured,
    queryFn: ProductsApi.featured,
    select: (data) => data.map((p) => localizeProduct(p, locale)),
  });
}

export function useBestsellers() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: productKeys.bestsellers,
    queryFn: ProductsApi.bestsellers,
    select: (data) => data.map((p) => localizeProduct(p, locale)),
  });
}

export function useCategories() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: ProductsApi.categories,
    select: (data) => data.map((c) => localizeCategory(c, locale)),
  });
}

export function usePriceRange() {
  return useQuery({ queryKey: productKeys.priceRange, queryFn: ProductsApi.priceRange });
}

export function useStoreConfig() {
  return useQuery({
    queryKey: ['store', 'config'],
    queryFn: ProductsApi.config,
    staleTime: 60 * 1000,
  });
}

/** Resolve a set of product ids into full products (for the comparison view). */
export function useCompareProducts(ids: string[]) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ['products', 'compare', ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const fetched = await Promise.all(
        ids.map(async (id) => {
          try {
            const data = await ProductsApi.getBySlug(id);
            return data.product;
          } catch {
            return null;
          }
        })
      );
      return fetched.filter((p): p is import('@/types').Product => Boolean(p));
    },
    enabled: ids.length > 0,
    placeholderData: (prev) => prev,
    select: (data) => data.map((p) => localizeProduct(p, locale)),
  });
}
