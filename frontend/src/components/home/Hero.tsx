'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconChevronLeft, IconChevronRight, IconLeaf, IconShield, IconTruck } from '@/components/ui/Icons';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

import { useI18n } from '@/i18n';

const slideMeta = [
  {
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=80',
    eyebrowKey: 'hero.slide1.eyebrow' as const,
    titleKey: 'hero.slide1.title' as const,
    copyKey: 'hero.slide1.copy' as const,
    ctaKey: 'hero.slide1.cta' as const,
    href: '/products?category=living-room',
  },
  {
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=80',
    eyebrowKey: 'hero.slide2.eyebrow' as const,
    titleKey: 'hero.slide2.title' as const,
    copyKey: 'hero.slide2.copy' as const,
    ctaKey: 'hero.slide2.cta' as const,
    href: '/products?sortBy=popularity',
  },
  {
    image:
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1920&q=80',
    eyebrowKey: 'hero.slide3.eyebrow' as const,
    titleKey: 'hero.slide3.title' as const,
    copyKey: 'hero.slide3.copy' as const,
    ctaKey: 'hero.slide3.cta' as const,
    href: '/products?category=dining',
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slideMeta.length);
    }, 7000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const go = (next: number) => {
    setIndex((next + slideMeta.length) % slideMeta.length);
  };

  const currentMeta = slideMeta[index];

  return (
    <section className="relative h-[88vh] min-h-[560px] max-h-[820px] w-full overflow-hidden bg-neutral-950">
      {/* Background */}
      <div className="absolute inset-0">
        {slideMeta.map((s, i) => (
          <motion.div
            key={s.titleKey}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          >
            <Image
              src={s.image}
              alt={t(s.titleKey)}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="container-afc relative flex h-full flex-col justify-center">
        <motion.div
          key={currentMeta.titleKey}
          className="max-w-2xl text-white"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-5 flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gold" />
            {t(currentMeta.eyebrowKey)}
          </p>
          <h1 className="text-balance font-display text-4xl font-medium leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {t(currentMeta.titleKey)}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
            {t(currentMeta.copyKey)}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href={currentMeta.href} variant="gold" size="lg">
              {t(currentMeta.ctaKey)}
              <IconArrowRight size={17} />
            </Button>
            <Button href="/products" variant="outline" size="lg" className="border-white/30 text-white hover:border-gold hover:text-gold">
              {t('hero.exploreCollection')}
            </Button>
          </div>
        </motion.div>

        {/* Dots + arrows */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container-afc flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {slideMeta.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    i === index ? 'w-10 bg-gold' : 'w-3 bg-white/40 hover:bg-white/70'
                  )}
                />
              ))}
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={() => go(index - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-all hover:border-gold hover:bg-gold hover:text-neutral-950"
                aria-label="Previous slide"
              >
                <IconChevronLeft size={20} />
              </button>
              <button
                onClick={() => go(index + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-all hover:border-gold hover:bg-gold hover:text-neutral-950"
                aria-label="Next slide"
              >
                <IconChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

export function TrustBar() {
  const { t } = useI18n();
  const items = [
    { icon: IconTruck, title: t('trust.firstClass'), copy: t('trust.freeShipping', { amount: '$1.499' }) },
    { icon: IconShield, title: t('trust.warranty'), copy: t('trust.warranty') },
    { icon: IconLeaf, title: t('trust.sustainably'), copy: t('trust.sustainably') },
    { icon: IconLeaf, title: t('trust.returns30'), copy: t('trust.comfort') },
  ];
  return (
    <section className="border-b border-line bg-surface text-ink">
      <div className="container-afc grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold">
              <item.icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="text-xs text-charcoal/70 dark:text-charcoal">{item.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
