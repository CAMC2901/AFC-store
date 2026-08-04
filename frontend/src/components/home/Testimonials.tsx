'use client';

import { useQuery } from '@tanstack/react-query';
import { MiscApi } from '@/services/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RatingStars } from '@/components/ui/RatingStars';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { IconLeaf } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

export function Testimonials() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: MiscApi.testimonials,
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
                    'flex h-full flex-col justify-between rounded-3xl border border-line p-7 transition-shadow hover:shadow-card-hover',
                    i === 0 && 'bg-ink text-ivory'
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
                        i === 0 ? 'bg-gold text-ink' : 'bg-mist text-ink'
                      )}
                    >
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className={cn('text-xs', i === 0 ? 'text-ivory/60' : 'text-charcoal/60')}>
                        {t.role}
                      </p>
                    </div>
                    <IconLeaf size={18} className={cn('ml-auto', i === 0 ? 'text-gold' : 'text-gold')} />
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
