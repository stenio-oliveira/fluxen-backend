import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logError, logWarn } from '../utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const secret = process.env.JWT_SECRET || 'default_secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    logWarn('Authentication failed: missing token', { path: req.path, method: req.method });
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      logWarn('Authentication failed: invalid token', {
        error: err.name,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};
