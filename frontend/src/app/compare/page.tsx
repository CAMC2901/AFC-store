'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore, MAX_COMPARE } from '@/store/useCompareStore';
import { useCompareProducts } from '@/hooks/useProducts';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { IconCompare, IconTrash } from '@/components/ui/Icons';
import type { Product } from '@/types';

function dims(p: { dimensions?: { width?: number; height?: number; depth?: number; unit?: string } }) {
  const d = p.dimensions;
  if (!d || (d.width === undefined && d.height === undefined && d.depth === undefined)) return '—';
  const unit = d.unit ?? 'in';
  return `${[d.width, d.height, d.depth].filter((v) => v !== undefined).join(' × ') ?? ''} ${unit}`;
}

export default function ComparePage() {
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const { data: products = [], isLoading } = useCompareProducts(ids);
  const { t, formatMoney } = useI18n();
  const warranty = t('trust.warranty');

  if (isLoading) {
    return (
      <div className="container-afc py-20">
        <div className="h-8 w-48 animate-pulse rounded bg-mist" />
        <div className="mt-8 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-mist" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container-afc py-20">
        <EmptyState
          icon={<IconCompare size={26} />}
          title={t('compare.empty')}
          description={t('compare.emptyDesc', { max: MAX_COMPARE })}
          action={<Button href="/products">{t('compare.browse')}</Button>}
        />
      </div>
    );
  }

  const stockCell = (p: { stock: number }) =>
    p.stock <= 0 ? (
      <Badge tone="red">{t('product.outOfStock')}</Badge>
    ) : (
      <Badge tone="green">{t('common.inStock')}</Badge>
    );

  type Row = { label: string; render: (p: Product) => React.ReactNode };

  const rows: Row[] = [
    { label: t('compare.price'), render: (p) => <span className="font-display text-xl font-semibold">{formatMoney(p.price)}</span> },
    { label: t('compare.rating'), render: (p) => <RatingStars rating={p.rating} showValue count={p.reviewCount} /> },
    { label: t('compare.stock'), render: stockCell },
    { label: t('compare.material'), render: (p) => p.material ?? '—' },
    { label: t('compare.color'), render: (p) => p.color ?? '—' },
    { label: t('compare.dimensions'), render: (p) => dims(p) },
    { label: t('compare.features'), render: (p) => (p.tags.length ? p.tags.map((tag) => `#${tag}`).join(', ') : '—') },
    { label: t('compare.warranty'), render: () => warranty },
  ];

  return (
    <div className="container-afc py-10 lg:py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium">{t('compare.title')}</h1>
        <button onClick={clear} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-charcoal transition-colors hover:border-gold hover:text-gold-dark">
          <IconTrash size={16} /> {t('compare.clear')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40" />
              {products.map((p) => (
                <th key={p.id} className="p-3 text-left align-top">
                  <Link href={`/products/${p.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                      <Image src={p.images[0]} alt={p.name} fill sizes="180px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-gold-dark">{p.categoryName}</p>
                        <h3 className="font-display text-base font-medium text-ink">{p.name}</h3>
                        <p className="text-xs text-charcoal">SKU: {p.sku}</p>
                      </div>
                      <button
                        onClick={() => remove(p.id)}
                        aria-label={t('common.delete')}
                        className="rounded-full p-1.5 text-charcoal/60 transition-colors hover:bg-mist hover:text-red-500"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="border-t border-line py-4 pr-4 text-xs font-semibold uppercase tracking-wider text-charcoal">{row.label}</td>
                {products.map((p) => (
                  <td key={p.id} className="border-t border-line p-3 align-top text-sm text-ink">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}