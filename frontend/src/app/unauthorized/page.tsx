import { ErrorCard } from '@/components/ui/ErrorCard';
import { IconUser } from '@/components/ui/Icons';

export default function UnauthorizedPage() {
  return (
    <ErrorCard
      code="401"
      title="Inicio de sesión requerido"
      description="Necesitas iniciar sesión para acceder a esta página. Inicia sesión para continuar tu compra o administrar tu cuenta."
      icon={<IconUser size={48} />}
      primaryLabel="Iniciar sesión"
      primaryHref="/login"
      secondaryLabel="Explorar la tienda"
      secondaryHref="/products"
    />
  );
}
