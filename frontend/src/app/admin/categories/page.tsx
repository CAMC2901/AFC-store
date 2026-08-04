'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: AdminApi.categories,
  });
  const { data: products } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => AdminApi.products({ limit: 200 }),
  });

  if (isLoading || !categories) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Categorías</h1>
        <p className="mt-1 text-sm text-charcoal/70">Organiza la colección por habitación y estilo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = products?.items.filter((p) => p.categoryId === c.id).length ?? c.productCount ?? 0;
          const inStock = products?.items.filter((p) => p.categoryId === c.id && p.stock > 0).length ?? 0;
          return (
            <div key={c.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg">{c.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-charcoal/60">{c.description}</p>
                </div>
                <Badge tone="muted">{count} productos</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-mist px-4 py-3 text-xs">
                <span className="text-charcoal/70">{inStock} en stock</span>
                <span className="font-semibold text-gold-dark">
                  {count === 0 ? '—' : `${formatPrice((products?.items.find((p) => p.categoryId === c.id)?.price ?? 0))}+`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
