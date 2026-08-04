'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_LOCALE, formatCurrency, formatLocalizedDate, type Locale } from './locale';
import { dictionaries, type Dictionary } from './dictionary';

const STORAGE_KEY = 'afc:locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Translate a key with optional interpolation params. */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Format an amount given in USD for the current locale+currency. */
  formatMoney: (amountUSD: number) => string;
  formatDate: (iso: string) => string;
  currency: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Best-effort detection from browser settings, defaulting to English. */
function detectLocale(): Locale {
  const stored = (() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  })();
  if (stored && stored in dictionaries) return stored as Locale;
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
    return 'es';
  }
  return DEFAULT_LOCALE;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    // Update <html lang> for accessibility/SEO helpers.
    document.documentElement.lang = next === 'es' ? 'es' : 'en';
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    const currency = locale === 'es' ? 'COP' : 'USD';
    return {
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === 'en' ? 'es' : 'en'),
      t: (key, params) => interpolate(dict[key as keyof Dictionary] ?? key, params),
      formatMoney: (amountUSD) => formatCurrency(amountUSD, locale),
      formatDate: (iso) => formatLocalizedDate(iso, locale),
      currency,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}