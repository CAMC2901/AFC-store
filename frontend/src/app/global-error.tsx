'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-[96px] font-bold leading-none text-gold/80 lg:text-[120px]">500</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-charcoal">
        Ocurrió un error inesperado. Inténtalo de nuevo o regresa a la tienda.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn-gold" onClick={reset}>
          Reintentar
        </button>
        <Link href="/" className="btn-outline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
