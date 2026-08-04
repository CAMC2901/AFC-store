'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Badge, StockBadge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { formatPrice, buildWhatsAppLink, discountPercent } from '@/lib/utils';
import { WHATSAPP } from '@/constants';
import {
  IconBox,
  IconHeart,
  IconHeartFilled,
  IconInfo,
  IconRuler,
  IconShare,
  IconShield,
  IconTruck,
  IconWhatsApp,
} from '@/components/ui/Icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useSupportStore } from '@/store/useSupportStore';
import { CompareToggle } from '@/components/products/CompareToggle';
import { ShareSheet } from '@/components/products/ShareSheet';
import { useI18n } from '@/i18n';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useProduct(slug);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !data) return <NotFoundCard />;

  const { product, related } = data;
  return <DetailContent product={product} related={related} router={router} />;
}

function DetailContent({
  product,
  related,
  router,
}: {
  product: import('@/types').Product;
  related: import('@/types').Product[];
  router: ReturnType<typeof useRouter>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<'cart' | 'buy' | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const { t } = useI18n();

  const status = useAuthStore((s) => s.status);
  const addToCart = useCartStore((s) => s.add);
  const ids = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const setSupport = useSupportStore((s) => s.setContext);

  useEffect(() => {
    setSupport(product.name);
    return () => setSupport(null);
  }, [product.name, setSupport]);

  const wished = ids.has(product.id);
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;

  const requireAuth = (): boolean => {
    if (status !== 'authenticated') {
      toast('Por favor, inicia sesión para continuar.');
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!requireAuth()) return;
    setBusy('cart');
    try {
      await addToCart(product.id, quantity);
      toast.success('Añadido a tu carrito.');
    } catch {
      toast.error('No se pudo añadir el artículo.');
    } finally {
      setBusy(null);
    }
  };

  const handleBuyNow = async () => {
    if (!requireAuth()) return;
    setBusy('buy');
    try {
      await addToCart(product.id, quantity);
      router.push('/checkout');
    } catch {
      toast.error('No se pudo iniciar el pago.');
      setBusy(null);
    }
  };

  const handleWishlist = async () => {
    if (!requireAuth()) return;
    try {
      await toggleWishlist(product.id);
      toast.success(wished ? 'Eliminado de favoritos.' : 'Guardado en favoritos.');
    } catch {
      toast.error('No se pudo actualizar favoritos.');
    }
  };

  const waLink = buildWhatsAppLink(
    WHATSAPP.number,
    WHATSAPP.message(`${product.name} (${formatPrice(product.price)})`)
  );

  const shareUrl = `/products/${product.slug}`;

  const dimensions = product.dimensions;
  const unit = dimensions?.unit ?? 'in';

  return (
    <>
      <div className="container-afc py-8 lg:py-14">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs text-charcoal/60">
          <Link href="/" className="hover:text-gold-dark">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.categorySlug}`} className="hover:text-gold-dark">
            {product.categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Info */}
          <div>
            <div className="flex items-center gap-3">
              <Badge tone="gold">{product.brand}</Badge>
              {discount && <Badge tone="dark">Ahorra {discount}%</Badge>}
              <StockBadge stock={product.stock} />
            </div>

            <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <RatingStars rating={product.rating} showValue count={product.reviewCount} />
              <span className="text-xs text-charcoal/60">SKU: {product.sku}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-4xl font-semibold text-ink">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-charcoal/50 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="mt-5 leading-relaxed text-charcoal">{product.description}</p>

            {/* Attribute chips */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {product.material && (
                <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink/70">{product.material}</span>
              )}
              {product.color && (
                <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink/70">{product.color}</span>
              )}
              {product.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink/70">#{tag}</span>
              ))}
            </div>

            {/* Quantity + actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QuantitySelector value={quantity} onChange={setQuantity} max={Math.max(1, product.stock)} />
              <Button
                onClick={handleAddToCart}
                loading={busy === 'cart'}
                disabled={outOfStock}
                className="flex-1 min-w-44"
                size="lg"
              >
                {outOfStock ? 'Agotado' : 'Agregar al carrito'}
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button onClick={handleBuyNow} variant="gold" size="lg" loading={busy === 'buy'} disabled={outOfStock}>
                Comprar ahora
              </Button>
              <Button variant="outline" size="lg" onClick={handleWishlist}>
                {wished ? <IconHeartFilled size={18} className="text-gold-dark" /> : <IconHeart size={18} />}
                {wished ? 'Guardado' : 'Favoritos'}
              </Button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Button variant="outline" size="md" onClick={() => setShareOpen(true)} className="flex-1">
                <IconShare size={18} /> {t('share.title')}
              </Button>
              <CompareToggle productId={product.id} />
            </div>
            <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} productName={product.name} shareUrl={shareUrl} />

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-6 py-3.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <IconWhatsApp size={18} /> Consultar por WhatsApp
            </a>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-line bg-surface p-4 text-center text-[11px]">
              {[
                { icon: IconTruck, label: 'Entrega de primera clase' },
                { icon: IconShield, label: 'Garantía de 10 años' },
                { icon: IconBox, label: 'Devoluciones en 30 días' },
              ].map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon size={20} className="mx-auto text-gold-dark" />
                  <p className="mt-1.5 text-charcoal/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: description / specs / dimensions */}
        <div className="mt-16">
          <Accordion
            defaultOpen={0}
            items={[
              {
                title: 'La historia',
                content: (
                  <div className="max-w-3xl">
                    <p className="text-charcoal">{product.longDescription ?? product.description}</p>
                  </div>
                ),
              },
              {
                title: 'Especificaciones',
                content: (
                  <div className="max-w-3xl">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                      <SpecRow label="Marca" value={product.brand} />
                      <SpecRow label="SKU" value={product.sku} />
                      <SpecRow label="Material" value={product.material ?? '—'} />
                      <SpecRow label="Color" value={product.color ?? '—'} />
                      <SpecRow label="Peso" value={product.weight ? `${product.weight} lb` : '—'} />
                      <SpecRow label="Montaje" value={dimensions?.assembly ?? 'Listo para usar'} />
                    </dl>
                  </div>
                ),
              },
              {
                title: 'Dimensiones',
                content: (
                  <div className="max-w-3xl">
                    <div className="grid grid-cols-3 gap-4 sm:max-w-md">
                      <DimensionBox label="Ancho" value={dimensions?.width} unit={unit} />
                      <DimensionBox label="Alto" value={dimensions?.height} unit={unit} />
                      <DimensionBox label="Fondo" value={dimensions?.depth} unit={unit} />
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-charcoal/60">
                      <IconRuler size={14} /> Dimensiones aproximadas en pulgadas; pueden existir ligeras variaciones.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Reviews summary */}
        <Reveal className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mist p-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-5xl font-semibold text-ink">{product.rating.toFixed(1)}</span>
            <div>
              <RatingStars rating={product.rating} />
              <p className="mt-1 text-xs text-charcoal/70">Basado en {product.reviewCount} reseñas verificadas</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <span key={star} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink/70">
                {star}★ {Math.round((product.reviewCount / Math.max(1, product.reviewCount)) * 40)}%
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Related */}
      <section className="container-afc pb-20">
        <SectionHeading
          eyebrow="Completa el look"
          title="También te puede gustar"
          align="left"
        />
        {related.length > 0 ? (
          <ProductGrid products={related} />
        ) : (
          <p className="text-charcoal">No se encontraron piezas relacionadas.</p>
        )}
      </section>
    </>
  );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 border-b border-line py-2">
    <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">{label}</dt>
    <dd className="text-right font-medium text-ink">{value}</dd>
  </div>
);

const DimensionBox = ({ label, value, unit }: { label: string; value?: number; unit: string }) => (
  <div className="rounded-2xl border border-line bg-surface p-4 text-center">
    <IconRuler size={18} className="mx-auto text-gold-dark" />
    <p className="mt-2 text-xs uppercase tracking-wider text-charcoal/60">{label}</p>
    <p className="mt-1 font-display text-xl text-ink">{value ?? '—'}{value !== undefined ? unit : ''}</p>
  </div>
);

function DetailSkeleton() {
  return (
    <div className="container-afc py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-mist" />
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-mist" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-mist" />
          <div className="h-8 w-40 animate-pulse rounded bg-mist" />
          <div className="h-24 w-full animate-pulse rounded bg-mist" />
          <div className="h-14 w-full animate-pulse rounded-full bg-mist" />
        </div>
      </div>
    </div>
  );
}

function NotFoundCard() {
  return (
    <div className="container-afc flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <IconInfo size={40} className="text-charcoal/40" />
      <h1 className="mt-4 font-display text-3xl">Producto no encontrado</h1>
      <p className="mt-2 text-charcoal">La pieza que buscas puede haber sido retirada.</p>
      <Button href="/products" className="mt-6">Explorar la colección</Button>
    </div>
  );
}
