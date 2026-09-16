'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CartApi } from '@/services/cart';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { EmptyState } from '@/components/ui/EmptyState';
import { PriceTag } from '@/components/ui/PriceTag';
import { IconArrowRight, IconCart, IconCheck, IconTag, IconTrash, IconTruck } from '@/components/ui/Icons';
import { formatPrice } from '@/lib/utils';
import { STANDARD_SHIPPING_FEE, EXPRESS_SHIPPING_FEE } from '@/constants';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n';
import { localizeCartLine } from '@/i18n/localize';

export default function CartPage() {
  const { lines, subtotal, update, remove } = useCartStore();
  const { locale } = useI18n();
  const isAuthed = useAuthStore((s) => s.status === 'authenticated');

  const localized = lines.map((l) => localizeCartLine(l, locale));

  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number; type: string; value: number } | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [totals, setTotals] = useState<{ shipping: number; discount: number; tax: number; total: number; freeShippingEligible: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  // Recompute shipping totals whenever cart/coupon/shipping changes.
  useEffect(() => {
    if (lines.length === 0) {
      setTotals(null);
      return;
    }
    setBusy(true);
    CartApi.totals({ couponCode: coupon?.code ?? undefined, shippingMethod })
      .then((t) => setTotals(t))
      .catch(() => {
        // Guest mode fallback calculation
        const disc = coupon?.discount ?? 0;
        const sub = Math.max(0, subtotal - disc);
        const free = sub >= 500000;
        const ship = free ? 0 : shippingMethod === 'express' ? 35000 : 20000;
        const tax = Math.round(sub * 0.19 * 100) / 100;
        setTotals({ shipping: ship, discount: disc, tax, total: sub + ship + tax, freeShippingEligible: free });
      })
      .finally(() => setBusy(false));
  }, [isAuthed, lines, coupon, shippingMethod, subtotal]);

  const applyCoupon = async () => {
    setBusy(true);
    try {
      const result = await CartApi.validateCoupon(couponCode.trim(), subtotal);
      setCoupon(result as typeof coupon);
      toast.success('Cupón aplicado.');
    } catch {
      toast.error('Este cupón no es válido para el carrito actual.');
      setCoupon(null);
    } finally {
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container-afc py-20">
        <EmptyState
          icon={<IconCart size={26} />}
          title="Tu carrito está vacío"
          description="Encontremos algo hermoso para tu espacio."
          action={<Button href="/products">Explorar la colección</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-afc py-10 lg:py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Tu selección</p>
          <h1 className="font-display text-4xl">Carrito de compras</h1>
        </div>
        <Link href="/products" className="text-sm font-semibold text-gold-dark hover:text-ink">
          Seguir comprando
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div>
          <ul className="space-y-4">
            {localized.map((line) => (
              <li key={line.productId} className="flex gap-5 rounded-2xl border border-line bg-surface p-4">
                <Link href={`/products/${line.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
                  <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${line.slug}`} className="font-display text-lg text-ink hover:text-gold-dark">
                        {line.name}
                      </Link>
                      <p className="text-xs text-charcoal/60">En stock · Envío en 3–7 días</p>
                    </div>
                    <button
                      onClick={() => remove(line.productId)}
                      className="rounded-full p-2 text-charcoal/50 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Eliminar ${line.name}`}
                    >
                      <IconTrash size={17} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantitySelector value={line.quantity} onChange={(q) => update(line.productId, q)} />
                    <PriceTag price={line.subtotal} size="md" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Resumen del pedido</h2>

          {/* Coupon */}
          <div className="mt-5">
            <label htmlFor="coupon" className="label">Código de cupón</label>
            <div className="flex gap-2">
              <input
                id="coupon"
                className="input"
                placeholder="ej. WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={applyCoupon} loading={busy} disabled={!couponCode.trim()}>
                Aplicar
              </Button>
            </div>
            {coupon && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <IconCheck size={14} /> {coupon.code} aplicado — ahorra {formatPrice(coupon.discount)}
              </p>
            )}
          </div>

          {/* Shipping */}
          <div className="mt-5">
            <p className="label">Método de envío</p>
            <div className="grid gap-2">
              <ShippingOption
                active={shippingMethod === 'standard'}
                label="Estándar · 5–7 días"
                price={STANDARD_SHIPPING_FEE}
                onClick={() => setShippingMethod('standard')}
              />
              <ShippingOption
                active={shippingMethod === 'express'}
                label="Express · 2–3 días"
                price={EXPRESS_SHIPPING_FEE}
                onClick={() => setShippingMethod('express')}
              />
            </div>
          </div>

          {/* Totals */}
          <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-charcoal">
              <dt>Subtotal</dt>
              <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
            </div>
            {totals && totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt>Descuento</dt>
                <dd>−{formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-charcoal">
              <dt>Envío</dt>
              <dd className="font-medium text-ink">
                {totals ? (totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping)) : '—'}
              </dd>
            </div>
            <div className="flex justify-between text-charcoal">
              <dt>Impuesto estimado</dt>
              <dd className="font-medium text-ink">{totals ? formatPrice(totals.tax) : '—'}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <dt className="font-display text-lg">Total</dt>
              <dd className="font-display text-2xl font-semibold">{totals ? formatPrice(totals.total) : formatPrice(subtotal)}</dd>
            </div>
          </dl>

          {totals && totals.freeShippingEligible && (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              <IconTruck size={15} /> ¡Has desbloqueado el envío gratis!
            </p>
          )}

          <Button href="/checkout" fullWidth size="lg" className="mt-6">
            Finalizar compra <IconArrowRight size={16} />
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-charcoal/60">
            <IconTag size={13} /> Pago seguro · Devoluciones en 30 días
          </p>
        </aside>
      </div>
    </div>
  );
}

function ShippingOption({
  active,
  label,
  price,
  onClick,
}: {
  active: boolean;
  label: string;
  price: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
        active ? 'border-gold bg-gold/5' : 'border-line hover:border-charcoal/30'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? 'border-gold bg-gold' : 'border-charcoal/30'}`}>
          {active && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
        </span>
        {label}
      </span>
      <span className="font-medium">{price === 0 ? 'Gratis' : formatPrice(price)}</span>
    </button>
  );
}
