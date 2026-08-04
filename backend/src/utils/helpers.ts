import crypto from 'node:crypto';

/** Slugify an arbitrary string for URLs, e.g. "Mid-Century Sofa" -> "mid-century-sofa". */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const randomId = (prefix: string): string =>
  `${prefix}_${crypto.randomBytes(6).toString('hex')}`;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Sanitize a free-text input: strip control chars and trim. */
export const sanitizeText = (value: unknown): string =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();

export const toNumber = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
