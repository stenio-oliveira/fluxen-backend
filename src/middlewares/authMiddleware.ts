import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'


const secret = process.env.JWT_SECRET || 'default_secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    next();
  });
};
