import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

// Extend Request interface to include equipamento
declare global {
  namespace Express {
    interface Request {
      equipamento?: any;
    }
  }
}

export const authenticateEquipamento = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ message: 'X-API-Key header is missing' });
  }

  try {
    const equipamento = await prisma.equipamento.findFirst({
      where: { api_key: { equals: apiKey } },
      include: {
        cliente: true,
        equipamento_metricas: {
          include: {
            metrica: true
          }
        }
      }
    });

    if (!equipamento) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    req.equipamento = equipamento;
    next();
  } catch (error) {
    console.error('Error validating API key:', error);
    return res.status(500).json({ message: 'Error validating API key' });
  }
};
