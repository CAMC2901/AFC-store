'use client';

import { useFeaturedProducts } from '@/hooks/useProducts';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/products/ProductCard';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { IconArrowRight } from '@/components/ui/Icons';
import Link from 'next/link';
import { useI18n } from '@/i18n';

export function FeaturedProducts() {
  const { data: products, isLoading, isError } = useFeaturedProducts();
  const { t } = useI18n();

  return (
    <section className="bg-mist/50 py-20 dark:bg-neutral-950">
      <div className="container-afc">
        <SectionHeading
          eyebrow={t('home.featured.eyebrow')}
          title={t('home.featured.title')}
          subtitle={t('home.featured.subtitle')}
          action={
            <Link
              href="/products?featured=true"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-dark transition-colors hover:text-ink dark:hover:text-ivory"
            >
              {t('common.viewAll')} <IconArrowRight size={16} />
            </Link>
          }
        />

        {isLoading ? (
          <GridSkeleton count={4} />
        ) : isError || !products ? (
          <EmptyState title="No se pudieron cargar los productos destacados" />
        ) : (
          <RevealGroup className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <RevealItem key={product.id}>
                <ProductCard product={product} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
