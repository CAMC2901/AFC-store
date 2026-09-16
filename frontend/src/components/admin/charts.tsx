'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/constants';
import { useI18n } from '@/i18n';

/** Store prices are in COP, so chart axes/tooltips format COP directly. */
const compactCOP = (cop: number): string => {
  const value = Math.abs(cop);
  if (value >= 1_000_000) return `$${(cop / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(cop / 1_000).toFixed(0)}k`;
  return `$${Math.round(cop)}`;
};

const formatDay = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(
    new Date(y, m - 1, d)
  );
};

const customTooltipContainer: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(212, 175, 55, 0.25)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  color: '#1c1917',
  boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  padding: '10px 14px',
  fontSize: 13,
};

const axisTick = { fill: '#78716c', fontSize: 11, fontWeight: 500 } as const;

const CATEGORY_PALETTE = ['#D4AF37', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#8B5CF6'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PROCESSING: '#3B82F6',
  SHIPPED: '#6366F1',
  DELIVERED: '#10B981',
  CANCELLED: '#EF4444',
};

export interface BarDatum {
  name: string;
  total: number;
  orders: number;
}

export interface TopSaleDatum {
  name: string;
  revenue: number;
  units: number;
}

/** Daily revenue area chart with ultra-smooth gold gradient & interactive hover dots. */
export function RevenueAreaChart({ data }: { data: Array<{ date: string; total: number; orders: number }> }) {
  const { t } = useI18n();
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(214, 211, 209, 0.4)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            dy={8}
          />
          <YAxis
            tickFormatter={compactCOP}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={customTooltipContainer}
            labelFormatter={(label) => formatDay(String(label))}
            formatter={(value, name) => [
              <span key="val" className="font-semibold text-gold-dark">{formatPrice(Number(value))}</span>,
              String(name) === 'total' ? t('admin.charts.ingresos') : t('admin.charts.pedidos'),
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#D4AF37"
            strokeWidth={3}
            fill="url(#goldGradient)"
            activeDot={{ r: 6, fill: '#1c1917', stroke: '#D4AF37', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusActiveShape(props: PieSectorDataItem) {
  const cx = props.cx ?? 0;
  const cy = props.cy ?? 0;
  const { innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  const status = (props.payload as { status?: string } | undefined)?.status;
  const count = (props.payload as { count?: number } | undefined)?.count ?? 0;
  const label = status ? ORDER_STATUS_LABELS[status] ?? status : '';

  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#78716c"
        fontSize={11}
        fontWeight={500}
        className="capitalize"
      >
        {label}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#1c1917" fontSize={20} fontWeight={700}>
        {count}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius ?? 0) + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

/** Interactive donut chart of order status distribution. */
export function StatusDonut({ data }: { data: Array<{ status: string; count: number }> }) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-charcoal/60">{t('admin.charts.noOrders')}</p>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const hoveredIndex = activeIndex ?? data.findIndex((d) => d.status === selected);

  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={4}
              strokeWidth={0}
              activeIndex={hoveredIndex === -1 ? undefined : hoveredIndex}
              activeShape={StatusActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? '#9CA3AF'}
                  opacity={selected && entry.status !== selected ? 0.3 : 1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-xs text-charcoal/60">
        {selected
          ? t('admin.charts.filtering', {
              status: (ORDER_STATUS_LABELS[selected] ?? selected).toLowerCase(),
              count: data.find((d) => d.status === selected)?.count ?? 0,
              total,
            })
          : t('admin.charts.totalOrders', { total })}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {data.map((entry) => {
          const highlighted = !selected || selected === entry.status;
          return (
            <li
              key={entry.status}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-line p-2 text-xs transition-all hover:bg-mist ${
                highlighted ? 'bg-surface shadow-xs' : 'opacity-40'
              }`}
              onMouseEnter={() => setActiveIndex(data.indexOf(entry))}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setSelected((s) => (s === entry.status ? null : entry.status))}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] ?? '#9CA3AF' }}
                />
                <span className="font-medium text-ink capitalize">{ORDER_STATUS_LABELS[entry.status] ?? entry.status}</span>
              </span>
              <span className="font-bold text-ink">{entry.count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Revenue per category as vertical gradient bars. */
export function CategoryRevenueChart({ data }: { data: BarDatum[] }) {
  const { t } = useI18n();
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-charcoal/60">{t('admin.charts.noSales')}</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(214, 211, 209, 0.4)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={data.length > 4 ? -18 : 0}
            textAnchor={data.length > 4 ? 'end' : 'middle'}
            height={data.length > 4 ? 44 : 28}
            dy={4}
          />
          <YAxis tickFormatter={compactCOP} tick={axisTick} tickLine={false} axisLine={false} width={64} />
          <Tooltip
            contentStyle={customTooltipContainer}
            formatter={(value, name) => [
              <span key="val" className="font-semibold text-gold-dark">{formatPrice(Number(value))}</span>,
              String(name) === 'total' ? t('admin.charts.sales') : t('admin.charts.pedidos'),
            ]}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Top products by revenue or units as horizontal gradient bars. */
export function TopSalesChart({
  data,
  metric = 'revenue',
}: {
  data: TopSaleDatum[];
  metric?: 'revenue' | 'units';
}) {
  const { t } = useI18n();
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-charcoal/60">{t('admin.charts.noSales')}</p>;
  }

  const valueKey = metric === 'revenue' ? 'revenue' : 'units';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(214, 211, 209, 0.4)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={metric === 'revenue' ? compactCOP : (n) => String(n)}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={customTooltipContainer}
            formatter={(value) => [
              <span key="val" className="font-semibold text-gold-dark">
                {metric === 'revenue' ? formatPrice(Number(value)) : `${value} unidades`}
              </span>,
              metric === 'revenue' ? t('admin.charts.ingresos') : t('admin.charts.units'),
            ]}
          />
          <Bar dataKey={valueKey} radius={[0, 8, 8, 0]} maxBarSize={24} fill="#D4AF37" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
