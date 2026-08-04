'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ProductGrid } from '@/components/products/ProductGrid';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/app/account/components';
import { IconHeart } from '@/components/ui/Icons';

export default function WishlistPage() {
  const { products, hydrate, isLoading } = useWishlistStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div>
      <PageHeader
        title="Mis favoritos"
        subtitle={`${products.length} pieza${products.length === 1 ? '' : 's'} guardadas — listas para cuando quieras.`}
      />

      {isLoading ? (
        <GridSkeleton count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<IconHeart size={26} />}
          title="Tu lista de favoritos está vacía"
          description="Toca el corazón en cualquier producto para guardarlo aquí."
          action={<Button href="/products">Descubrir piezas</Button>}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
