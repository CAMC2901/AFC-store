'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { OrdersApi } from '@/services/orders';
import { Button } from '@/components/ui/Button';
import { Card } from './components';
import { ORDER_STATUS_LABELS } from '@/constants';
import { formatDate, formatPrice, initials } from '@/lib/utils';
import { IconArrowRight, IconBox, IconHeart } from '@/components/ui/Icons';

export default function AccountOverview() {
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.ids.size);
  const [recentOrders, setRecentOrders] = useState<import('@/types').Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrdersApi.mine({ limit: 3 })
      .then((r) => setRecentOrders(r.items))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-2xl bg-ink p-8 text-ivory">
        <p className="text-xs uppercase tracking-widest text-gold">Resumen</p>
        <h1 className="mt-2 font-display text-3xl">
          Hola de nuevo, {user?.firstName}
        </h1>
        <p className="mt-2 text-sm text-ivory/70">
          Miembro desde {user ? formatDate(user.createdAt) : '—'}. Gestiona tu perfil, pedidos y lista de deseos desde aquí.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          icon={<IconBox size={20} />}
          label="Artículos en el carrito"
          value={String(cartCount)}
          href="/cart"
        />
        <Card
          icon={<IconHeart size={20} />}
          label="Lista de deseos"
          value={String(wishlistCount)}
          href="/account/wishlist"
        />
        <Card
          icon={<IconBox size={20} />}
          label="Pedidos"
          value={recentOrders.length > 0 ? `${recentOrders.length}+` : '0'}
          href="/account/orders"
        />
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Pedidos recientes</h2>
          <Link href="/account/orders" className="text-sm font-semibold text-gold-dark hover:text-ink">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal/60">Cargando pedidos…</p>
        ) : recentOrders.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-charcoal/70">Aún no tienes pedidos: tu primera pieza te espera.</p>
            <Button href="/products" variant="outline" size="sm" className="mt-4">
              Empezar a comprar
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">
                    <span className="font-mono text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className="ml-2 text-xs text-charcoal/60">{formatDate(order.createdAt)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal/70">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} {order.items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'artículo' : 'artículos'} · {ORDER_STATUS_LABELS[order.status]}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mist transition-colors hover:bg-gold hover:text-ink"
                    aria-label="Ver pedido"
                  >
                    <IconArrowRight size={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/profile"
          className="group rounded-2xl border border-line bg-surface p-6 transition-all hover:border-gold hover:shadow-card-hover"
        >
          <p className="font-display text-lg">Editar perfil</p>
          <p className="mt-1 text-sm text-charcoal/70">
            Actualiza tu nombre, correo, teléfono y contraseña. {initials(user?.firstName ?? '', user?.lastName)}
          </p>
        </Link>
        <Link
          href="/account/addresses"
          className="group rounded-2xl border border-line bg-surface p-6 transition-all hover:border-gold hover:shadow-card-hover"
        >
          <p className="font-display text-lg">Gestionar direcciones</p>
          <p className="mt-1 text-sm text-charcoal/70">Mantén tus direcciones de envío y facturación actualizadas.</p>
        </Link>
      </div>
    </div>
  );
}
