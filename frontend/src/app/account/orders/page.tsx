'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { OrdersApi } from '@/services/orders';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/app/account/components';
import { ORDER_STATUS_LABELS } from '@/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import { IconBox } from '@/components/ui/Icons';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setOrders(null);
    OrdersApi.mine()
      .then((r) => setOrders(r.items))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <PageHeader title="Mis pedidos" subtitle="Seguimiento de entregas y revisión de compras anteriores." />

      {orders === null ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} className="text-gold" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<IconBox size={26} />}
          title="Aún no hay pedidos"
          description="Cuando realices un pedido aparecerá aquí con actualizaciones de estado en vivo."
          action={<Link href="/products" className="btn-primary">Empezar a comprar</Link>}
        />
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-line bg-surface p-5 transition-all hover:border-gold hover:shadow-card-hover"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-semibold">#{order.id.slice(-8).toUpperCase()}</span>
                  <span className="text-xs text-charcoal/60">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="muted">{ORDER_STATUS_LABELS[order.status]}</Badge>
                  <span className="font-display text-lg font-semibold">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 rounded-xl bg-mist p-2 pr-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-surface">
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div>
                      <p className="max-w-44 truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-charcoal/60">Cant. {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
