'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/constants';
import { IconBox, IconChart, IconDollar, IconUsers } from '@/components/ui/Icons';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: AdminApi.analytics,
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  const { summary, topProducts, lowStock } = data;
  const maxStatus = Math.max(1, ...summary.ordersByStatus.map((s) => s.count));

  const stats = [
    { label: 'Ingresos', value: formatPrice(summary.totalRevenue), icon: IconDollar, sub: 'Histórico' },
    { label: 'Pedidos', value: String(summary.totalOrders), icon: IconChart, sub: `${summary.ordersByStatus.length} estados` },
    { label: 'Clientes', value: String(summary.totalCustomers), icon: IconUsers, sub: 'Cuentas registradas' },
    { label: 'Productos', value: String(summary.totalProducts), icon: IconBox, sub: 'SKUs activos' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Panel de control</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-charcoal/60">{s.label}</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
                <s.icon size={18} />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-charcoal/50">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl">Pedidos por estado</h2>
          <div className="mt-5 space-y-4">
            {summary.ordersByStatus.length === 0 && <p className="text-sm text-charcoal/60">Aún no hay pedidos.</p>}
            {summary.ordersByStatus.map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize">{ORDER_STATUS_LABELS[s.status] ?? s.status}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full rounded-full bg-gold transition-all"
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl">Productos destacados</h2>
          <ul className="mt-4 divide-y divide-line">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-display text-lg text-charcoal/40">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-charcoal/60">{p.reviewCount} reseñas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(p.price)}</p>
                  <Badge tone={p.stock > 0 ? 'green' : 'red'}>{p.stock} en stock</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Pedidos recientes</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-gold-dark hover:text-ink">
              Ver todos
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {summary.recentOrders.length === 0 && <p className="py-4 text-sm text-charcoal/60">Aún no hay pedidos.</p>}
            {summary.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-mono font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-charcoal/60">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="muted">{ORDER_STATUS_LABELS[o.status]}</Badge>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl">Alertas de stock bajo</h2>
          <ul className="mt-4 space-y-3">
            {lowStock.length === 0 && <p className="text-sm text-charcoal/60">Todos los productos bien surtidos.</p>}
            {lowStock.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl bg-mist px-4 py-3 text-sm">
                <span className="truncate font-medium">{p.name}</span>
                <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : 'text-gold-dark'}`}>
                  {p.stock} restantes
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
