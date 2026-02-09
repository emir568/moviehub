import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type UserJwt = {
  userId: string;
  email: string;
};

export type AuthenticatedRequest = Request & { user?: UserJwt };

export const authGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Missing authentication token.' });
    return;
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as UserJwt;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid authentication token.' });
  }
};
