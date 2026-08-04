const words = ['Artesanal', 'Considerado', 'Durable', 'Elegante', 'Sostenible', 'Atemporal', 'Cómodo', 'Refinado'];

/** Infinite marquee brand strip. */
export function BrandStrip() {
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-line bg-ink py-5">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((word, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl uppercase tracking-widest text-ivory/70">
            {word}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
