'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/constants';
import { IconBox, IconChart, IconDollar, IconUsers } from '@/components/ui/Icons';
import { useI18n } from '@/i18n';
import { localizeProduct } from '@/i18n/localize';
import { CategoryRevenueChart, RevenueAreaChart, StatusDonut, TopSalesChart } from '@/components/admin/charts';

const RANGES = [7, 30, 90];

export default function AdminDashboard() {
  const { locale, t } = useI18n();
  const [days, setDays] = useState(30);
  const [topMetric, setTopMetric] = useState<'revenue' | 'units'>('revenue');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: ({ queryKey }) => AdminApi.analytics(queryKey[2] as number),
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  const { summary, lowStock, revenueSeries, revenueByCategory, topByRevenue, topByUnits } = data;
  const low = lowStock.map((p) => localizeProduct(p, locale));
  const localizedName = (name: string, nameEn?: string) => (locale === 'en' ? nameEn || name : name);

  const stats = [
    { label: t('admin.stats.revenue'), value: formatPrice(summary.totalRevenue), icon: IconDollar, sub: t('admin.stats.historical') },
    { label: t('admin.stats.orders'), value: String(summary.totalOrders), icon: IconChart, sub: t('admin.stats.statuses', { count: summary.ordersByStatus.length }) },
    { label: t('admin.stats.customers'), value: String(summary.totalCustomers), icon: IconUsers, sub: t('admin.stats.accounts') },
    { label: t('admin.stats.products'), value: String(summary.totalProducts), icon: IconBox, sub: t('admin.stats.skus') },
  ];

  const categoryData = revenueByCategory.map((c) => ({
    name: localizedName(c.name, c.nameEn),
    total: c.total,
    orders: c.orders,
  }));
  const topSource = topMetric === 'revenue' ? topByRevenue : topByUnits;
  const topSalesData = topSource.map((s) => ({
    name: localizedName(s.name, s.nameEn),
    revenue: s.revenue,
    units: s.units,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">{t('admin.charts.dashboard')}</h1>

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

      {/* Revenue trend + status donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">{t('admin.charts.revenueTrend', { days })}</h2>
            <div className="flex gap-1 rounded-full bg-mist p-1">
              {RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDays(range)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    days === range
                      ? 'bg-gold text-ivory'
                      : 'text-charcoal/70 hover:text-ink'
                  }`}
                >
                  {t('admin.charts.days', { days: range })}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <RevenueAreaChart data={revenueSeries} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl">{t('admin.charts.ordersByStatus')}</h2>
          <div className="mt-4">
            <StatusDonut data={summary.ordersByStatus} />
          </div>
        </div>
      </div>

      {/* Category + top sales */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl">{t('admin.charts.salesByCategory')}</h2>
          <p className="mt-1 text-xs text-charcoal/50">{t('admin.charts.categorySub', { days })}</p>
          <div className="mt-4">
            <CategoryRevenueChart data={categoryData} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">{t('admin.charts.topProducts')}</h2>
              <p className="mt-1 text-xs text-charcoal/50">{t('admin.charts.lastDays', { days })}</p>
            </div>
            <div className="flex gap-1 rounded-full bg-mist p-1">
              {(
                [
                  { key: 'revenue', label: t('admin.charts.ingresos') },
                  { key: 'units', label: t('admin.charts.units') },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTopMetric(opt.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    topMetric === opt.key
                      ? 'bg-gold text-ivory'
                      : 'text-charcoal/70 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <TopSalesChart data={topSalesData} metric={topMetric} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">{t('admin.orders.recent')}</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-gold-dark hover:text-ink">
              {t('admin.orders.viewAll')}
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {summary.recentOrders.length === 0 && <p className="py-4 text-sm text-charcoal/60">{t('admin.charts.noOrders')}</p>}
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
          <h2 className="font-display text-xl">{t('admin.stock.alerts')}</h2>
          <ul className="mt-4 space-y-3">
            {lowStock.length === 0 && <p className="text-sm text-charcoal/60">{t('admin.stock.none')}</p>}
            {low.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl bg-mist px-4 py-3 text-sm">
                <span className="truncate font-medium">{p.name}</span>
                <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : 'text-gold-dark'}`}>
                  {t('admin.stock.remaining', { count: p.stock })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
