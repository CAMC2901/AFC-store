'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ORDER_STATUS_LABELS } from '@/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n';
import { localizeOrderItem } from '@/i18n/localize';

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { locale } = useI18n();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => AdminApi.orders({ limit: 50, status: statusFilter === 'ALL' ? undefined : statusFilter }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => AdminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      toast.success('Estado del pedido actualizado.');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Pedidos</h1>
          <p className="mt-1 text-sm text-charcoal/70">{data?.pagination.total ?? '…'} pedidos registrados</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', ...statuses].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-ink text-ivory' : 'bg-surface text-charcoal hover:bg-mist'
              }`}
            >
              {s === 'ALL' ? 'Todos' : ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} className="text-gold" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wider text-charcoal/60">
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Artículos</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((o) => (
                  <tr key={o.id} className="align-middle transition-colors hover:bg-mist/40">
                    <td className="px-5 py-3 font-mono font-semibold">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{o.contact.firstName} {o.contact.lastName}</p>
                      <p className="text-xs text-charcoal/60">{o.contact.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex -space-x-2">
                        {o.items.slice(0, 4).map((item) => (
                          <div key={item.productId} className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-mist">
                            <Image src={item.image} alt={localizeOrderItem(item, locale).name} fill sizes="36px" className="object-cover" />
                          </div>
                        ))}
                        {o.items.length > 4 && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-ink text-[10px] font-bold text-ivory">
                            +{o.items.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3 text-charcoal/70">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                        className="input w-auto cursor-pointer px-3 py-1 text-xs font-medium"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(o)}>
                        Ver Pedido
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => {
            statusMutation.mutate({ id: selectedOrder.id, status });
            setSelectedOrder((prev) => (prev ? { ...prev, status: status as Order['status'] } : null));
          }}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}) {
  const { locale } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-ivory p-6 shadow-modal space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display text-2xl">Pedido #{order.id.slice(-8).toUpperCase()}</h2>
            <p className="text-xs text-charcoal/60">Realizado el {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="input w-auto text-xs font-semibold"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        {/* Customer & Address Info */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold text-charcoal/60 uppercase tracking-wider mb-1">Cliente & Contacto</p>
            <p className="font-medium text-sm text-ink">{order.contact.firstName} {order.contact.lastName}</p>
            <p className="text-charcoal">{order.contact.email}</p>
            <p className="text-charcoal">{order.contact.phone || 'Sin teléfono'}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold text-charcoal/60 uppercase tracking-wider mb-1">Dirección de Envío</p>
            <p className="font-medium text-ink">{order.shippingAddress.line1} {order.shippingAddress.line2 || ''}</p>
            <p className="text-charcoal">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p className="text-charcoal">{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <p className="font-semibold text-xs text-charcoal/60 uppercase tracking-wider mb-3">Productos del Pedido</p>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface px-4">
            {order.items.map((item) => {
              const loc = localizeOrderItem(item, locale);
              return (
                <li key={item.productId} className="flex items-center gap-4 py-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
                    <Image src={item.image} alt={loc.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{loc.name}</p>
                    <p className="text-xs text-charcoal/60">{formatPrice(item.unitPrice)} c/u × {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Totals Summary */}
        <dl className="space-y-1.5 rounded-2xl border border-line bg-mist/50 p-4 text-xs">
          <div className="flex justify-between text-charcoal">
            <dt>Subtotal</dt>
            <dd className="font-medium text-ink">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <dt>Descuento ({order.couponCode || 'Cupón'})</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-charcoal">
            <dt>Envío</dt>
            <dd className="font-medium text-ink">{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between text-charcoal">
            <dt>Impuesto</dt>
            <dd className="font-medium text-ink">{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
            <dt>Total del Pedido</dt>
            <dd className="font-display text-base text-gold-dark">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
