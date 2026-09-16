'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { OrdersApi } from '@/services/orders';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import { IconBox, IconCheck, IconTruck } from '@/components/ui/Icons';
import { useI18n } from '@/i18n';
import { localizeOrderItem } from '@/i18n/localize';

export default function OrderDetailPage() {
  const { locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';

  const [order, setOrder] = useState<import('@/types').Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrdersApi.getById(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={<IconBox size={26} />}
        title="Pedido no encontrado"
        action={<Button href="/account/orders">Volver a mis pedidos</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-700">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
            <IconCheck size={20} />
          </span>
          <div>
            <p className="font-semibold">¡Pedido confirmado!</p>
            <p className="text-sm">Hemos recibido tu pedido y te enviaremos el seguimiento por correo cuando se envíe.</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-ink p-7 text-ivory">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Pedido</p>
            <h1 className="mt-1 font-display text-2xl">#{order.id.slice(-8).toUpperCase()}</h1>
            <p className="mt-1 text-sm text-ivory/60">Realizado el {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Badge tone="gold">{ORDER_STATUS_LABELS[order.status]}</Badge>
            <Badge tone="muted">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg">Progreso de la entrega</h2>
        <div className="mt-5 flex items-center">
          {[
            { label: 'Realizado', done: true },
            { label: 'En proceso', done: order.status !== 'PENDING' },
            { label: 'Enviado', done: ['SHIPPED', 'DELIVERED'].includes(order.status) },
            { label: 'Entregado', done: order.status === 'DELIVERED' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step.done ? 'bg-gold text-ink' : 'bg-mist text-charcoal/50'
                  }`}
                >
                  {step.done ? <IconCheck size={14} /> : i + 1}
                </span>
                <span className={`mt-1.5 text-[11px] ${step.done ? 'font-semibold text-ink' : 'text-charcoal/50'}`}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${step.done ? 'bg-gold' : 'bg-line'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg">Artículos</h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((raw) => {
            const item = localizeOrderItem(raw, locale);
            return (
              <li key={item.productId} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-mist">
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-charcoal/60">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                </div>
                <span className="font-semibold">{formatPrice(item.subtotal)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summary + address */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg">Enviar a</h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal">
            {order.contact.firstName} {order.contact.lastName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && <><br />{order.shippingAddress.line2}</>}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg">Resumen</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-charcoal"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600"><dt>Descuento</dt><dd>−{formatPrice(order.discount)}</dd></div>
            )}
            <div className="flex justify-between text-charcoal"><dt>Envío</dt><dd>{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</dd></div>
            <div className="flex justify-between text-charcoal"><dt>Impuesto</dt><dd>{formatPrice(order.tax)}</dd></div>
            <div className="flex items-center justify-between border-t border-line pt-2">
              <dt className="font-display text-base">Total</dt>
              <dd className="font-display text-xl font-semibold">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-mist p-5 text-sm">
        <span className="flex items-center gap-2 text-charcoal">
          <IconTruck size={18} className="text-gold-dark" /> ¿Necesitas ayuda con este pedido?
        </span>
        <Button href="/contact" variant="outline" size="sm">Contactar soporte</Button>
      </div>
    </div>
  );
}
