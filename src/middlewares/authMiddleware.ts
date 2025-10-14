import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'


const secret = process.env.JWT_SECRET || 'default_secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('req.headers: ', req.headers)
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('token: ', token)

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next();
  });
};
