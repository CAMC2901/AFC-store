'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

export default function AdminCouponsPage() {
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: AdminApi.coupons,
  });

  if (isLoading || !coupons) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Cupones</h1>
        <p className="mt-1 text-sm text-charcoal/70">Códigos promocionales disponibles al pagar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => {
          const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
          const exhausted = c.usageLimit !== undefined && c.usedCount >= c.usageLimit;
          return (
            <div key={c.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-lg border-2 border-dashed border-gold px-3 py-1 font-mono text-sm font-bold tracking-wider text-gold-dark">
                  {c.code}
                </span>
                <Badge tone={!c.isActive || expired || exhausted ? 'red' : 'green'}>
                  {!c.isActive ? 'Inactivo' : expired ? 'Vencido' : exhausted ? 'Límite alcanzado' : 'Activo'}
                </Badge>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-charcoal">
                <p>
                  <span className="font-semibold text-ink">
                    {c.type === 'PERCENTAGE' ? `${c.value}% de descuento` : `${formatPrice(c.value)} de descuento`}
                  </span>
                </p>
                <p>Subtotal mín.: <span className="font-medium text-ink">{formatPrice(c.minSubtotal)}</span></p>
                {c.maxDiscount && <p>Descuento máx.: {formatPrice(c.maxDiscount)}</p>}
                <p>Usado: <span className="font-medium text-ink">{c.usedCount}</span>{c.usageLimit ? ` / ${c.usageLimit}` : ''}</p>
                {c.expiresAt && <p>Vence: {new Date(c.expiresAt).toLocaleDateString()}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
