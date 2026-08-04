import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/**
 * Default price formatting targets Colombian Pesos (COP) — the store's primary
 * currency. Convert an amount given in USD to COP using the configured rate.
 * Uses the number format from `src/i18n/locale.ts` semantics (es-CO).
 */
export const formatPrice = (amountUSD: number, currency = 'COP'): string => {
  const I18N_RATE = 4200;
  const value = currency === 'COP' ? amountUSD * I18N_RATE : amountUSD;

  if (currency === 'COP') {
    const formatted = new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(value));
    return `$${formatted} COP`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
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
