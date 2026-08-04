import { cn } from '@/lib/utils';

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando"
    />
  );
}
