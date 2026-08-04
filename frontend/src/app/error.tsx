'use client';

import { Button } from '@/components/ui/Button';
import { IconRefresh } from '@/components/ui/Icons';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-afc flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="font-display text-3xl">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-charcoal">
        Ocurrió un error inesperado al renderizar esta página. Inténtalo de nuevo.
      </p>
      <Button onClick={reset} className="mt-6">
        <IconRefresh size={16} /> Reintentar
      </Button>
    </div>
  );
}
