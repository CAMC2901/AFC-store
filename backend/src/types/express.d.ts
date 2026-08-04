import { Request, Response, NextFunction } from 'express';
import { PublicUser } from './index';

/** Augments the Express request with the authenticated user (set by auth middleware). */
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      userId?: string;
    }
  }
}

/** Typed async controller handler used by catchAsync. */
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;
