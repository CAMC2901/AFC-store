export const COOKIE_NAMES = {
  ACCESS: 'afc_access_token',
  REFRESH: 'afc_refresh_token',
} as const;

export const API_PREFIX = '/api/v1';

export const FREE_SHIPPING_THRESHOLD = 1500000;
export const STANDARD_SHIPPING_FEE = 25000;
export const EXPRESS_SHIPPING_FEE = 40000;
export const TAX_RATE = 0.08;

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export const PASSWORD_MIN_LENGTH = 8;

export const WHATSAPP_NUMBER = '573001234567';

/** Rate-limit windows (ms). */
export const RATE_LIMIT = {
  general: { windowMs: 15 * 60 * 1000, max: 300 },
  auth: { windowMs: 15 * 60 * 1000, max: 30 },
  newsletter: { windowMs: 60 * 60 * 1000, max: 10 },
  assistant: { windowMs: 15 * 60 * 1000, max: 40 },
} as const;

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export const SORT_OPTIONS = [
  'price_asc',
  'price_desc',
  'newest',
  'rating',
  'popularity',
] as const;

export const BRAND = {
  name: 'AFC',
  tagline: 'Vida Artesanal, Elevada.',
  email: 'care@afcfurniture.com',
  phone: '+57 (300) 123-4567',
  whatsappNumber: WHATSAPP_NUMBER,
  address: 'Calle 76 # 54-11, Alto Prado, Barranquilla, Colombia',
} as const;
