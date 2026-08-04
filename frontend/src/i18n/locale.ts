export type Locale = 'es' | 'en';

/** Default locale is Spanish (Colombia) — Colombian pesos. */
export const DEFAULT_LOCALE: Locale = 'es';

/** Currency config per locale. */
export const LOCALE_CURRENCY: Record<Locale, string> = {
  en: 'USD',
  es: 'COP',
};

/**
 * Exchange rate configuration (USD base).
 * Future-ready: populate from a provider, saw notification, or admin settings.
 */
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  COP: 4200,
};

export interface LocaleStrings {
  format: 'intl' | 'suffix';
  suffix?: string;
}

/**
 * Format an amount (in USD) for a locale, converting units and applying local
 * number/currency conventions.
 */
export function formatCurrency(
  amountUSD: number,
  locale: Locale,
  currency?: string
): string {
  const code = currency ?? LOCALE_CURRENCY[locale];
  const rate = EXCHANGE_RATES[code] ?? 1;
  const value = amountUSD * rate;

  if (code === 'COP') {
    // e.g. $1.250.000 COP
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
}

/** Simple date formatting per locale. */
export function formatLocalizedDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}