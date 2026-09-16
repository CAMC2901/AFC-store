'use client';

import { useQuery } from '@tanstack/react-query';
import { MiscApi } from '@/services/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RatingStars } from '@/components/ui/RatingStars';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { IconLeaf } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { localizeTestimonial } from '@/i18n/localize';

export function Testimonials() {
  const { locale } = useI18n();
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: MiscApi.testimonials,
    select: (data) => data.map((t) => localizeTestimonial(t, locale)),
  });

  return (
    <section className="bg-surface py-20">
      <div className="container-afc">
        <SectionHeading
          eyebrow="Palabras amables"
          title="Amado por hogares de toda América"
          subtitle="Diseñadores, propietarios y profesionales de la hotelería confían en AFC para crear el ambiente."
        />

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-56 rounded-3xl" />
            ))}
          </div>
        ) : (
          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials?.slice(0, 6).map((t, i) => (
              <RevealItem key={t.id}>
                <figure
                  className={cn(
                    'flex h-full flex-col justify-between rounded-3xl border p-7 transition-all hover:shadow-card-hover',
                    i === 0
                      ? 'border-gold/40 bg-neutral-900 text-white dark:bg-neutral-950 dark:border-gold/40'
                      : 'border-line bg-surface text-ink dark:border-neutral-800 dark:bg-neutral-900'
                  )}
                >
                  <div>
                    <RatingStars rating={t.rating} />
                    <blockquote className="mt-4 font-display text-lg leading-relaxed">
                      “{t.content}”
                    </blockquote>
                  </div>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-full font-display text-lg',
                        i === 0 ? 'bg-gold text-neutral-950' : 'bg-mist text-ink dark:bg-neutral-800'
                      )}
                    >
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className={cn('text-xs', i === 0 ? 'text-white/70' : 'text-charcoal/60 dark:text-neutral-400')}>
                        {t.role}
                      </p>
                    </div>
                    <IconLeaf size={18} className="ml-auto text-gold" />
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
