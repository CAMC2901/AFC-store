'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Product } from '@/types';
import { cn, discountPercent, formatPrice } from '@/lib/utils';
import { RatingStars } from '@/components/ui/RatingStars';
import { StockBadge } from '@/components/ui/Badge';
import { IconHeart, IconHeartFilled, IconCart } from '@/components/ui/Icons';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CompareToggle } from './CompareToggle';
import toast from 'react-hot-toast';

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ids = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isAuthed = useAuthStore((s) => s.status === 'authenticated');
  const addToCart = useCartStore((s) => s.add);
  const [busy, setBusy] = useState(false);

  const discount = discountPercent(product);
  const wished = ids.has(product.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthed) {
      toast('Inicia sesión para guardar productos en favoritos.');
      return;
    }
    setBusy(true);
    try {
      await toggleWishlist(product.id);
      toast.success(wished ? 'Eliminado de favoritos.' : 'Guardado en favoritos.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthed) {
      toast('Inicia sesión para agregar productos al carrito.');
      return;
    }
    setBusy(true);
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} agregado al carrito.`);
    } catch {
      toast.error('No se pudo agregar el producto. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.article
      className={cn('group relative card overflow-hidden p-0 transition-shadow duration-500 hover:shadow-card-hover', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-700 ease-out',
              hovered && 'scale-105'
            )}
          />
          {/* Degradado */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Insignias */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink shadow">
                -{discount}%
              </span>
            )}
            {product.featured && (
              <span className="rounded-full bg-overlay/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ivory backdrop-blur">
                Destacado
              </span>
            )}
          </div>

          {/* Favoritos */}
          <button
            onClick={handleWishlist}
            disabled={busy}
            aria-label={wished ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={cn(
              'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all duration-300',
              wished
                ? 'bg-gold text-ink'
                : 'bg-surface/80 text-ink hover:bg-gold hover:text-ink'
            )}
          >
            {wished ? <IconHeartFilled size={17} /> : <IconHeart size={17} />}
          </button>

          {/* Comparar — junto a favoritos, siempre clicable */}
          <div className="absolute right-[3.4rem] top-3 z-10">
            <CompareToggle productId={product.id} iconOnly />
          </div>

          {/* Compra rápida — aparece al pasar el cursor */}
          <div
            className={cn(
              'absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100',
              !isAuthed && 'pointer-events-none'
            )}
          >
            <button
              onClick={handleQuickAdd}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-overlay/90 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory backdrop-blur transition-colors hover:bg-gold hover:text-ink"
            >
              <IconCart size={15} /> Agregar al carrito
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-dark">
            {product.categoryName}
          </p>
          <h3 className="mt-1 truncate font-display text-base font-medium text-ink">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xs text-charcoal/50 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <RatingStars rating={product.rating} showValue />
            <StockBadge stock={product.stock} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}