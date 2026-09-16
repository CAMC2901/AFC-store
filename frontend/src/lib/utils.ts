import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/**
 * Format an amount in Colombian Pesos (COP) — the store's only currency.
 * Amounts are stored and priced directly in COP; no conversion is applied.
 */
export const formatPrice = (amountCOP: number): string => {
  const formatted = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amountCOP));
  return `$${formatted} COP`;
};

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));

export const discountPercent = (product: {
  price: number;
  compareAtPrice?: number;
}): number | null => {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round((1 - product.price / product.compareAtPrice) * 100);
};

export const buildWhatsAppLink = (number: string, message: string): string =>
  `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

export const initials = (firstName: string, lastName?: string): string =>
  `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase();

export const truncate = (text: string, length: number): string =>
  text.length > length ? `${text.slice(0, length)}…` : text;
