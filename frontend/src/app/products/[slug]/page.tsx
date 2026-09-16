'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProduct } from '@/hooks/useProducts';
import { ProductsApi } from '@/services/products';
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
  const [currentRating, setCurrentRating] = useState(product.rating);
  const [currentReviewCount, setCurrentReviewCount] = useState(product.reviewCount);
  const [hoverStar, setHoverStar] = useState(0);
  const [ratingBusy, setRatingBusy] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [comments, setComments] = useState<Array<{ id: string; name: string; date: string; rating: number; text: string }>>([
    {
      id: '1',
      name: 'Camila Mendoza',
      date: 'Hace 2 días',
      rating: 5,
      text: 'Excelente calidad y acabados. Llegó muy rápido a Barranquilla y supera todas las expectativas de diseño.',
    },
    {
      id: '2',
      name: 'Carlos Gutiérrez',
      date: 'Hace 1 semana',
      rating: 5,
      text: 'Totalmente recomendado. La textura de los materiales es suave, sólida y luce impecable en la sala.',
    },
  ]);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [userRating, setUserRating] = useState(5);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setRatingBusy(true);
    try {
      const author = commentAuthor.trim() || 'Cliente Verificado';
      const newComment = {
        id: Date.now().toString(),
        name: author,
        date: 'Hace un momento',
        rating: userRating,
        text: commentText.trim(),
      };
      setComments((prev) => [newComment, ...prev]);
      const updated = await ProductsApi.rateProduct(product.id, userRating);
      setCurrentRating(updated.rating);
      setCurrentReviewCount(updated.reviewCount);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      setCommentText('');
      setCommentAuthor('');
      toast.success('¡Tu comentario y calificación han sido publicados!');
    } catch {
      toast.error('No se pudo publicar el comentario.');
    } finally {
      setRatingBusy(false);
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    setRatingBusy(true);
    try {
      const updated = await ProductsApi.rateProduct(product.id, rating);
      setCurrentRating(updated.rating);
      setCurrentReviewCount(updated.reviewCount);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`¡Gracias por calificar con ${rating} estrellas!`);
    } catch {
      toast.error('No se pudo registrar la calificación.');
    } finally {
      setRatingBusy(false);
    }
  };

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
    setBusy('buy');
    try {
      await addToCart(product.id, quantity);
      router.push('/cart');
    } catch {
      toast.error('No se pudo iniciar la compra.');
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
  const unit = dimensions?.unit ?? 'cm';

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
                      <SpecRow label="Peso" value={product.weight ? `${product.weight} kg` : '—'} />
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
                      <IconRuler size={14} /> Dimensiones pueden tener ligeras variaciones.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Reviews & Comments Section */}
        <section className="mt-16 space-y-8">
          <SectionHeading eyebrow={t('reviews.eyebrow')} title={t('reviews.title')} align="left" />

          <Reveal className="grid gap-8 rounded-3xl border border-line bg-mist p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 lg:grid-cols-12">
            {/* Rating Summary Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 dark:border-neutral-800 dark:bg-neutral-950 lg:col-span-4">
              <div>
                <span className="font-display text-6xl font-semibold text-ink">
                  {currentRating.toFixed(1)}
                </span>
                <div className="mt-2">
                  <RatingStars rating={currentRating} />
                  <p className="mt-1.5 text-xs text-charcoal/70 dark:text-neutral-400">
                    {t('product.reviews', { count: currentReviewCount })}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-4 dark:border-neutral-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal/80 dark:text-neutral-300">
                  {t('reviews.quickRating')}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingSubmit(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      disabled={ratingBusy}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <span
                        className={`text-2xl ${
                          star <= (hoverStar || Math.round(currentRating))
                            ? 'text-amber-400'
                            : 'text-stone-300 dark:text-neutral-700'
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <form
              onSubmit={handleCommentSubmit}
              className="flex flex-col space-y-4 rounded-2xl border border-line bg-surface p-6 dark:border-neutral-800 dark:bg-neutral-950 lg:col-span-8"
            >
              <h3 className="font-display text-lg font-semibold text-ink">
                {t('reviews.write')}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label dark:text-neutral-300" htmlFor="commentAuthor">
                    {t('reviews.authorLabel')}
                  </label>
                  <input
                    id="commentAuthor"
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder={t('reviews.authorPlaceholder')}
                    className="w-full rounded-lg border border-line bg-mist px-4 py-2.5 text-sm text-ink transition-all focus:border-gold focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder-neutral-500"
                  />
                </div>
                <div>
                  <label className="label dark:text-neutral-300">{t('reviews.ratingLabel')}</label>
                  <div className="flex h-10 items-center gap-1.5 rounded-lg border border-line bg-mist px-3 dark:border-neutral-700 dark:bg-neutral-900">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="text-lg transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span className={star <= userRating ? 'text-amber-400' : 'text-stone-300 dark:text-neutral-700'}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="label dark:text-neutral-300" htmlFor="commentText">
                  {t('reviews.commentLabel')}
                </label>
                <textarea
                  id="commentText"
                  rows={4}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('reviews.commentPlaceholder')}
                  className="w-full resize-none rounded-lg border border-line bg-mist p-4 text-sm text-ink transition-all focus:border-gold focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder-neutral-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={ratingBusy} size="md">
                  {t('reviews.submit')}
                </Button>
              </div>
            </form>
          </Reveal>

          {/* List of Published Comments */}
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 font-bold text-gold-dark dark:bg-gold/10 dark:text-gold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{c.name}</p>
                      <p className="text-xs text-charcoal/60 dark:text-neutral-400">{c.date}</p>
                    </div>
                  </div>
                  <RatingStars rating={c.rating} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-charcoal dark:text-neutral-300">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Related */}
      <section className="container-afc pb-20">
        <SectionHeading
          eyebrow={t('product.completeTheLook')}
          title={t('product.youMayAlsoLove')}
          align="left"
        />
        {related.length > 0 ? (
          <ProductGrid products={related} />
        ) : (
          <p className="text-charcoal">{t('product.noRelated')}</p>
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
  const { t } = useI18n();
  return (
    <div className="container-afc flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <IconInfo size={40} className="text-charcoal/40" />
      <h1 className="mt-4 font-display text-3xl">{t('product.notFound')}</h1>
      <p className="mt-2 text-charcoal">{t('product.notFoundDesc')}</p>
      <Button href="/products" className="mt-6">{t('product.browse')}</Button>
    </div>
  );
}
