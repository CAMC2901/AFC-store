export type Locale = 'es' | 'en';

/** Default locale is Spanish (Colombia). */
export const DEFAULT_LOCALE: Locale = 'es';

/**
 * The store operates exclusively in Colombian Pesos (COP). Amounts are stored
 * and displayed in COP with no currency conversion.
 */
export function formatCurrency(amountCOP: number): string {
  // e.g. $1.250.000 COP
  const formatted = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amountCOP));
  return `$${formatted} COP`;
}

/** Simple date formatting per locale. */
export function formatLocalizedDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}