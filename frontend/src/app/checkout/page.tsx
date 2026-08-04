'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AccountApi } from '@/services/account';
import { OrdersApi } from '@/services/orders';
import { CartApi } from '@/services/cart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconBox, IconCheck, IconLock, IconTruck } from '@/components/ui/Icons';
import { cn, formatPrice } from '@/lib/utils';
import type { Address, CartTotals } from '@/types';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCartStore();
  const isAuthed = useAuthStore((s) => s.status === 'authenticated');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [totals, setTotals] = useState<CartTotals | null>(null);
  const [placing, setPlacing] = useState(false);

  const subtotal = useCartStore((s) => s.subtotal);

  // Load addresses + totals
  useEffect(() => {
    if (!isAuthed) return;
    AccountApi.addresses().then((addrs) => {
      setAddresses(addrs);
      const def = addrs.find((a) => a.isDefault) ?? addrs[0];
      if (def) setSelectedAddress(def.id);
    }).catch(() => undefined);
    CartApi.totals({ shippingMethod }).then(setTotals).catch(() => undefined);
  }, [isAuthed, shippingMethod]);

  if (!isAuthed) {
    return (
      <div className="container-afc py-20">
        <EmptyState
          icon={<IconLock size={26} />}
          title="Inicia sesión para pagar"
          description="Los invitados pueden explorar la colección, pero se requiere una cuenta para realizar un pedido."
          action={<Button href="/login?next=/checkout">Inicia sesión</Button>}
        />
      </div>
    );
  }

  if (lines.length === 0 && !placing) {
    return (
      <div className="container-afc py-20">
        <EmptyState
          icon={<IconBox size={26} />}
          title="Nada que pagar"
          description="Tu carrito está vacío. Añade algunas piezas antes de continuar."
          action={<Button href="/products">Explorar muebles</Button>}
        />
      </div>
    );
  }

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddress(addr.id);
    setForm((f) => ({
      ...f,
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const order = await OrdersApi.checkout({
        shippingAddress: {
          label: 'Pago',
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        contact: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
        },
        shippingMethod,
      });
      await clear();
      toast.success('¡Pedido realizado con éxito!');
      router.push(`/account/orders/${order.id}?success=1`);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo realizar tu pedido. Inténtalo de nuevo.';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const shippingCost = totals?.shipping ?? 0;

  return (
    <div className="container-afc py-10 lg:py-14">
      <p className="eyebrow mb-2">Casi listo</p>
      <h1 className="font-display text-4xl">Pago</h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          {/* Contact */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl">1 · Datos de contacto</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" name="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Apellido" name="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Correo electrónico" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Teléfono" type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl">2 · Dirección de envío</h2>

            {addresses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleAddressSelect(addr)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-xs font-medium transition-all',
                      selectedAddress === addr.id
                        ? 'border-gold bg-gold/10 text-gold-dark'
                        : 'border-line text-charcoal hover:border-gold'
                    )}
                  >
                    {addr.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Dirección 1" name="line1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required className="sm:col-span-2" />
              <Input label="Dirección 2 (opcional)" name="line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="sm:col-span-2" />
              <Input label="Ciudad" name="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              <Input label="Departamento" name="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              <Input label="Código postal" name="postalCode" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
              <Input label="País" name="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl">3 · Entrega</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MethodCard
                active={shippingMethod === 'standard'}
                icon={IconTruck}
                title="Estándar"
                subtitle="5–7 días hábiles"
                price={totals?.freeShippingEligible ? 0 : 49}
                onClick={() => setShippingMethod('standard')}
              />
              <MethodCard
                active={shippingMethod === 'express'}
                icon={IconBox}
                title="Express"
                subtitle="2–3 días hábiles"
                price={89}
                onClick={() => setShippingMethod('express')}
              />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl">4 · Pago</h2>
            <div className="mt-5 rounded-xl bg-mist p-4 text-sm text-charcoal">
              <p className="flex items-center gap-2 font-medium text-ink">
                <IconCheck size={16} className="text-emerald-600" /> Pago de demostración seguro
              </p>
              <p className="mt-1 text-xs">
                La integración de pasarela de pago está lista para Wompi. Para esta demo, los pedidos se crean con
                estado de pago <span className="font-mono font-semibold">PENDIENTE</span> y se gestionan fuera de línea.
              </p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Resumen del pedido</h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-mist">
                  <Image src={line.image} alt={line.name} fill sizes="48px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-ivory">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-charcoal/60">{formatPrice(line.unitPrice)} c/u</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(line.subtotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {totals && totals.discount > 0 && <Row label="Descuento" value={`−${formatPrice(totals.discount)}`} accent />}
            <Row label="Envío" value={shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)} />
            <Row label="Impuesto (8%)" value={totals ? formatPrice(totals.tax) : '—'} />
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl font-semibold">{totals ? formatPrice(totals.total) : formatPrice(subtotal)}</span>
            </div>
          </dl>

          <Button type="submit" fullWidth size="lg" loading={placing} className="mt-6">
            {placing ? 'Realizando pedido…' : `Realizar pedido · ${totals ? formatPrice(totals.total) : ''}`}
          </Button>
          <p className="mt-3 text-center text-xs text-charcoal/60">
            Al realizar tu pedido aceptas nuestros Términos de servicio.
          </p>
        </aside>
      </form>
    </div>
  );
}

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex justify-between text-charcoal">
    <span>{label}</span>
    <span className={cn('font-medium text-ink', accent && 'text-emerald-600')}>{value}</span>
  </div>
);

function MethodCard({
  active,
  icon: Icon,
  title,
  subtitle,
  price,
  onClick,
}: {
  active: boolean;
  icon: typeof IconTruck;
  title: string;
  subtitle: string;
  price: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-4 text-left transition-all',
        active ? 'border-gold bg-gold/5' : 'border-line hover:border-charcoal/30'
      )}
    >
      <div className="flex items-center justify-between">
        <Icon size={22} className={active ? 'text-gold-dark' : 'text-charcoal/50'} />
        <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border', active ? 'border-gold bg-gold' : 'border-charcoal/30')}>
          {active && <IconCheck size={12} className="text-ink" />}
        </span>
      </div>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-xs text-charcoal/60">{subtitle}</p>
      <p className="mt-1.5 font-medium">{price === 0 ? 'Gratis' : formatPrice(price)}</p>
    </button>
  );
}
