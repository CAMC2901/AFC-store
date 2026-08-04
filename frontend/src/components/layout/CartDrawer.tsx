'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { useCartStore } from '@/store/useCartStore';
import { useLockBodyScroll } from '@/hooks/useGeneral';
import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/constants';
import { IconArrowRight, IconCart, IconClose, IconTrash } from '@/components/ui/Icons';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const { lines, subtotal, update, remove } = useCartStore();
  const isAuthed = useAuthStore((s) => s.status === 'authenticated');
  const [busy, setBusy] = useState<string | null>(null);

  useLockBodyScroll(open);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleUpdate = async (productId: string, quantity: number) => {
    setBusy(productId);
    try {
      await update(productId, quantity);
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setBusy(productId);
    try {
      await remove(productId);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-overlay/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-label="Carrito de compras"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <IconCart size={22} className="text-gold-dark" /> Tu Carrito
              </h2>
              <button
                onClick={close}
                className="rounded-full p-2 text-charcoal transition-colors hover:bg-mist"
                aria-label="Cerrar carrito"
              >
                <IconClose size={20} />
              </button>
            </div>

            {/* Free shipping progress */}
            {lines.length > 0 && (
              <div className="border-b border-line px-6 py-4">
                <p className="text-xs text-charcoal">
                  {remaining > 0 ? (
                    <>
                      Añade <span className="font-semibold text-gold-dark">{formatPrice(remaining)}</span> más
                      para entrega gratuita de primera clase
                    </>
                  ) : (
                    <span className="font-semibold text-emerald-600">
                      ¡Has desbloqueado el envío gratuito!
                    </span>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <motion.div
                    className="h-full rounded-full bg-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <EmptyState
                  icon={<IconCart size={26} />}
                  title="Tu carrito está vacío"
                  description="Explora nuestra colección y encuentra algo hermoso para tu hogar."
                  action={
                    <Button href="/products" onClick={close}>
                      Explorar muebles
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-5">
                  {lines.map((line) => (
                    <li key={line.productId} className="flex gap-4">
                      <Link
                        href={`/products/${line.slug}`}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-mist"
                        onClick={close}
                      >
                        <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${line.slug}`}
                            onClick={close}
                            className="font-display text-sm font-medium text-ink hover:text-gold-dark"
                          >
                            {line.name}
                          </Link>
                          <button
                            onClick={() => handleRemove(line.productId)}
                            disabled={busy === line.productId}
                            className="text-charcoal/50 transition-colors hover:text-red-500"
                            aria-label={`Eliminar ${line.name}`}
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-charcoal/60">{formatPrice(line.unitPrice)} c/u</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <QuantitySelector
                            size="sm"
                            value={line.quantity}
                            max={Math.min(99, line.stock)}
                            onChange={(q) => handleUpdate(line.productId, q)}
                          />
                          <span className="font-semibold text-ink">{formatPrice(line.subtotal)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="space-y-3 border-t border-line px-6 py-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal">Subtotal</span>
                  <span className="font-display text-lg font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-charcoal/60">
                  Envío e impuestos calculados al finalizar la compra.
                </p>
                <Button
                  href={isAuthed ? '/checkout' : '/login'}
                  onClick={close}
                  fullWidth
                  size="lg"
                >
                  {isAuthed ? 'Finalizar compra' : 'Inicia sesión para pagar'}
                  <IconArrowRight size={16} />
                </Button>
                <button
                  onClick={close}
                  className="w-full text-center text-xs font-semibold uppercase tracking-widest text-charcoal transition-colors hover:text-gold-dark"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
