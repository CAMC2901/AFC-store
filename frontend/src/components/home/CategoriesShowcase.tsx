'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCategories } from '@/hooks/useProducts';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { IconArrowRight } from '@/components/ui/Icons';

import { useI18n } from '@/i18n';

export function CategoriesShowcase() {
  const { data: categories, isLoading } = useCategories();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <section className="container-afc py-20">
        <Skeleton className="mx-auto mb-10 h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container-afc py-20">
      <SectionHeading
        eyebrow={t('home.categories.eyebrow')}
        title={t('home.categories.title')}
      />
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <RevealItem key={category.id}>
            <Link
              href={`/products?category=${category.slug}`}
              className="group relative block h-56 overflow-hidden rounded-2xl lg:h-64"
            >
              <Image
                src={category.imageUrl ?? ''}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <h3 className="font-display text-xl text-white">{category.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-widest text-white/70">
                    {category.productCount ?? 0} {t('cart.items')}
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all duration-300 group-hover:bg-gold group-hover:text-neutral-950">
                  <IconArrowRight size={17} />
                </span>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
