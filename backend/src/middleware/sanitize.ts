import { NextFunction, Request, Response } from 'express';
import { sanitizeText } from '../utils/helpers';

const sanitizeValue = (val: unknown): unknown => {
  if (typeof val === 'string') {
    return sanitizeText(val);
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object' && val.constructor === Object) {
    const sanitizedObj: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      sanitizedObj[key] = sanitizeValue((val as Record<string, unknown>)[key]);
    }
    return sanitizedObj;
  }
  return val;
};

/**
 * Recursive body sanitization to strip control characters and prevent
 * prototype pollution across arbitrarily nested JSON payloads.
 */
export const sanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  next();
};
