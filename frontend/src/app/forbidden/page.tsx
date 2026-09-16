import { ErrorCard } from '@/components/ui/ErrorCard';
import { IconLock } from '@/components/ui/Icons';

export default function ForbiddenPage() {
  return (
    <ErrorCard
      code="403"
      title="Acceso denegado"
      description="No tienes permiso para ver esta página. Si crees que es un error, contacta con soporte."
      icon={<IconLock size={48} />}
      primaryLabel="Volver al inicio"
      primaryHref="/"
      secondaryLabel="Visitar la tienda"
      secondaryHref="/products"
    />
  );
}
