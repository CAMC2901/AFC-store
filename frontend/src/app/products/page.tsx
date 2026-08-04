'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useGeneral';
import { FiltersSidebar, type Filters } from '@/components/products/FiltersSidebar';
import { ProductCard } from '@/components/products/ProductCard';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SortSelect } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { IconSearch, IconSliders } from '@/components/ui/Icons';
import { SORT_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';
import type { ProductQuery } from '@/types';

function ProductsPageContent() {
  const router = useRouter();
  const params = useSearchParams();

  // --- Read state from URL (single source of truth) ---
  const search = params.get('search') ?? '';
  const sortBy = params.get('sortBy') ?? 'popularity';
  const page = Number(params.get('page') ?? 1);
  const debouncedSearch = useDebounce(search, 400);

  const filters: Filters = useMemo(
    () => ({
      category: params.get('category') ?? undefined,
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      material: params.get('material') ?? undefined,
      color: params.get('color') ?? undefined,
      inStock: params.get('inStock') === 'true' || undefined,
      featured: params.get('featured') === 'true' || undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.toString()]
  );

  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isError } = useProducts(
    {
      search: debouncedSearch || undefined,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      material: filters.material,
      color: filters.color,
      inStock: filters.inStock,
      featured: filters.featured,
      sortBy: sortBy as ProductQuery['sortBy'],
      page,
    },
    true
  );

  /** Update the URL while preserving other params. */
  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === undefined) next.delete(key);
        else next.set(key, String(value));
      }
      next.delete('page'); // reset to page 1 on filter change
      router.push(`/products${next.toString() ? `?${next.toString()}` : ''}`, { scroll: false });
    },
    [params, router]
  );

  const handleFilterChange = (next: Filters) => {
    updateParams({
      category: next.category ?? null,
      minPrice: next.minPrice ?? null,
      maxPrice: next.maxPrice ?? null,
      material: next.material ?? null,
      color: next.color ?? null,
      inStock: next.inStock ? 'true' : null,
      featured: next.featured ? 'true' : null,
    });
  };

  const clearFilters = () => {
    updateParams({
      category: null,
      minPrice: null,
      maxPrice: null,
      material: null,
      color: null,
      inStock: null,
      featured: null,
      search: null,
    });
  };

  const activeFilterCount =
    [filters.category, filters.material, filters.color, filters.minPrice, filters.maxPrice].filter(Boolean)
      .length + (filters.inStock ? 1 : 0) + (filters.featured ? 1 : 0);

  return (
    <div className="container-afc py-10 lg:py-14">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">La Colección</p>
          <h1 className="font-display text-4xl sm:text-5xl">
            {filters.category ? prettyCategory(filters.category) : 'Todos los muebles'}
          </h1>
          <p className="mt-2 text-sm text-charcoal">
            {search && (
              <span className="mr-2">
                Resultados para “<span className="font-medium text-ink">{search}</span>”
              </span>
            )}
            {data?.pagination.total !== undefined && (
              <span>{data.pagination.total} pieza{data.pagination.total !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <IconSliders size={15} /> Filtros{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
          <SortSelect value={sortBy} onChange={(v) => updateParams({ sortBy: v })} options={SORT_OPTIONS} />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <FiltersSidebar
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />

        <div>
          {isLoading ? (
            <GridSkeleton count={8} />
          ) : isError ? (
            <EmptyState title="No se pudieron cargar los productos" description="Por favor, inténtalo de nuevo en un momento." />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={<IconSearch size={26} />}
              title="Ninguna pieza coincide con tus filtros"
              description="Ajusta o limpia tus filtros para ver más de la colección."
              action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
            />
          ) : (
            <>
              <div
                className={cn(
                  'grid grid-cols-2 gap-4 sm:gap-6',
                  data.items.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                )}
              >
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                className="mt-12"
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={(p) => updateParams({ page: p })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const prettyCategory = (slug: string) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export default function ProductsPage() {
  return (
    <Suspense fallback={<GridSkeleton count={8} />}>
      <ProductsPageContent />
    </Suspense>
  );
}
