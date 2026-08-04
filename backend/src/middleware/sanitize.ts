import { NextFunction, Request, Response } from 'express';
import { sanitizeText } from '../utils/helpers';

/**
 * Lightweight body sanitization to strip control characters from free-text
 * fields before they reach controllers/services.
 */
export const sanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeText(req.body[key]);
      }
    }
  }
  next();
};
