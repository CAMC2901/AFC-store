import { Button } from '@/components/ui/Button';
import { IconBox } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <div className="container-afc flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-[120px] font-bold leading-none text-gold">404</p>
      <h1 className="mt-2 font-display text-3xl">Esta página se ha mudado</h1>
      <p className="mt-3 max-w-md text-charcoal">
        La página que buscas no existe, pero hay mucho mobiliario hermoso que sí.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Volver al inicio</Button>
        <Button href="/products" variant="outline">
          <IconBox size={16} /> Explorar colección
        </Button>
      </div>
    </div>
  );
}
