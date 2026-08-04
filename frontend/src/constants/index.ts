export const SITE = {
  name: 'AFC',
  tagline: 'Vida Artesanal, Elevada.',
  description:
    'AFC cura mobiliario premium para el hogar moderno: materiales refinados, siluetas atemporales y entrega de primera clase.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

export const API = {
  baseUrl: '/api/v1',
} as const;

export const WHATSAPP = {
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '15551234567',
  message: (productName?: string) =>
    `Hola AFC, me interesa${productName ? ` el ${productName}` : ' su mobiliario'}. ¿Me pueden compartir más detalles?`,
} as const;

export const FREE_SHIPPING_THRESHOLD = 1499;
export const TAX_RATE = 0.08;

export const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'popularity', label: 'Más populares' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor valorados' },
];

export const MATERIALS = ['Oak', 'Walnut', 'Velvet', 'Marble', 'Brass', 'Steel', 'Linen', 'Bouclé'];
export const COLORS = ['Black', 'White', 'Ivory', 'Walnut', 'Charcoal', 'Natural', 'Cream', 'Gold'];

export const MATERIAL_LABELS: Record<string, string> = {
  Oak: 'Roble',
  Walnut: 'Nogal',
  Velvet: 'Terciopelo',
  Marble: 'Mármol',
  Brass: 'Latón',
  Steel: 'Acero',
  Linen: 'Lino',
  'Bouclé': 'Buclé',
};

export const COLOR_LABELS: Record<string, string> = {
  Black: 'Negro',
  White: 'Blanco',
  Ivory: 'Marfil',
  Walnut: 'Nogal',
  Charcoal: 'Carbón',
  Natural: 'Natural',
  Cream: 'Crema',
  Gold: 'Dorado',
};

export const NAV_LINKS = [
  { label: 'Sala de estar', href: '/products?category=living-room' },
  { label: 'Dormitorio', href: '/products?category=bedroom' },
  { label: 'Comedor', href: '/products?category=dining' },
  { label: 'Oficina', href: '/products?category=office' },
  { label: 'Iluminación', href: '/products?category=lighting' },
  { label: 'Decor', href: '/products?category=decor' },
];

export const PER_PAGE_OPTIONS = [12, 24, 48];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
};
