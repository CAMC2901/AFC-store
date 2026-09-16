'use client';

import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconBox, IconClock, IconRuler } from '@/components/ui/Icons';

import { useI18n } from '@/i18n';

export function Promotions() {
  const { t } = useI18n();

  return (
    <section className="container-afc py-20">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Large promo card */}
        <Reveal className="relative min-h-[420px] overflow-hidden rounded-3xl bg-neutral-950 text-white">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80"
            alt="Private sale sofa"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-70 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white sm:p-12">
            <p className="eyebrow text-gold">{t('home.promotions.eyebrow')}</p>
            <h3 className="mt-3 max-w-md font-display text-3xl text-white sm:text-4xl">
              {t('home.promotions.title')}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Desbloquea un 10 % adicional al unirte a la lista de AFC y comprar los nuevos lanzamientos de la temporada.
            </p>
            <div className="mt-6">
              <Button href="/register" variant="gold">
                {t('home.promotions.cta')} <IconArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Side stack */}
        <div className="grid gap-6">
          <Reveal delay={0.1} className="relative min-h-[200px] overflow-hidden rounded-3xl border border-line bg-surface text-ink dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                alt="Home office desk"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/70 to-transparent dark:from-neutral-900/95 dark:via-neutral-900/70" />
            </div>
            <div className="relative flex h-full flex-col justify-center p-8 sm:p-10">
              <p className="eyebrow text-gold-dark dark:text-gold">{t('nav.office')}</p>
              <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Diseña tu zona de concentración</h3>
              <p className="mt-2 max-w-xs text-sm text-charcoal dark:text-neutral-300">
                Sillas ergonómicas y escritorios de roble con gestión discreta de cables.
              </p>
              <Button href="/products?category=office" variant="outline" size="sm" className="mt-5 self-start border-line text-ink dark:border-neutral-700">
                {t('common.viewAll')}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="rounded-3xl border border-gold/30 bg-neutral-950 p-8 text-white sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="eyebrow text-gold">Por qué AFC</p>
                <h3 className="mt-2 font-display text-2xl text-white sm:text-3xl">Hecho para vivirse</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: IconBox, label: t('trust.firstClass') },
                  { icon: IconRuler, label: t('trust.sustainably') },
                  { icon: IconClock, label: t('trust.returns30') },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <Icon size={24} className="mx-auto text-gold" />
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
