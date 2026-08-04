'use client';

import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconBox, IconClock, IconRuler } from '@/components/ui/Icons';

export function Promotions() {
  return (
    <section className="container-afc py-20">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Large promo card */}
        <Reveal className="relative min-h-[420px] overflow-hidden rounded-3xl bg-ink">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80"
            alt="Sofá en venta privada"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-70 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-ivory sm:p-12">
            <p className="eyebrow text-gold">Solo miembros</p>
            <h3 className="mt-3 max-w-md font-display text-3xl sm:text-4xl">
              Vista previa privada: hasta 30 % de descuento
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/80">
              Desbloquea un 10 % adicional al unirte a la lista de AFC y comprar los nuevos lanzamientos de la temporada.
            </p>
            <div className="mt-6">
              <Button href="/register" variant="gold">
                Únete y ahorra <IconArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Side stack */}
        <div className="grid gap-6">
          <Reveal delay={0.1} className="relative min-h-[200px] overflow-hidden rounded-3xl bg-mist">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                alt="Escritorio para trabajar en casa"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/60 to-transparent" />
            </div>
            <div className="relative flex h-full flex-col justify-center p-8 sm:p-10">
              <p className="eyebrow">Oficina en casa</p>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl">Diseña tu zona de concentración</h3>
              <p className="mt-2 max-w-xs text-sm text-charcoal">
                Sillas ergonómicas y escritorios de roble con gestión discreta de cables.
              </p>
              <Button href="/products?category=office" variant="outline" size="sm" className="mt-5 self-start">
                Comprar oficina
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="rounded-3xl bg-ink p-8 text-ivory sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="eyebrow text-gold">Por qué AFC</p>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl">Hecho para vivirse</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: IconBox, label: 'Entrega de primera clase' },
                  { icon: IconRuler, label: 'Tamaños reales' },
                  { icon: IconClock, label: 'Envío en 3–7 días' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <Icon size={24} className="mx-auto text-gold" />
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-ivory/70">{label}</p>
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
