import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'dark',
  className,
}: {
  children: React.ReactNode;
  tone?: 'dark' | 'gold' | 'red' | 'green' | 'muted';
  className?: string;
}) {
  const tones = {
    dark: 'bg-ink text-ivory',
    gold: 'bg-gold text-ink',
    red: 'bg-red-600 text-white',
    green: 'bg-emerald-600 text-white',
    muted: 'bg-mist text-charcoal border border-line',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge tone="red">Agotado</Badge>;
  if (stock <= 10) return <Badge tone="gold">{stock} disponibles</Badge>;
  return <Badge tone="green">Disponible</Badge>;
}
