import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'

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
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('req.headers: ', req.headers);
  console.log('req.url: ', req.url);
  console.log('req.method: ', req.method);

  const authHeader = req.headers['authorization'];
  console.log('authHeader: ', authHeader);

  const token = authHeader?.split(' ')[1];
  console.log('extracted token: ', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      console.log('Token verification error:', err);
      console.log('Error name:', err.name);
      console.log('Error message:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Adiciona o usuário decodificado ao request
    req.user = decoded;
    console.log('Token verified successfully, user:', decoded);
    console.log('=== AUTH MIDDLEWARE END ===');
    next();
  });
};
