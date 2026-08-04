export const COOKIE_NAMES = {
  ACCESS: 'afc_access_token',
  REFRESH: 'afc_refresh_token',
} as const;

export const API_PREFIX = '/api/v1';

export const FREE_SHIPPING_THRESHOLD = 1499;
export const STANDARD_SHIPPING_FEE = 49;
export const EXPRESS_SHIPPING_FEE = 89;
export const TAX_RATE = 0.08;

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 60;

export const PASSWORD_MIN_LENGTH = 8;

export const WHATSAPP_NUMBER = '15551234567';

/** Rate-limit windows (ms). */
export const RATE_LIMIT = {
  general: { windowMs: 15 * 60 * 1000, max: 300 },
  auth: { windowMs: 15 * 60 * 1000, max: 30 },
  newsletter: { windowMs: 60 * 60 * 1000, max: 10 },
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
  tagline: 'Crafted Living, Elevated.',
  email: 'care@afcfurniture.com',
  phone: '+1 (555) 123-4567',
  whatsappNumber: WHATSAPP_NUMBER,
  address: '1280 Fifth Avenue, New York, NY 10029',
} as const;
