import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';
import { logError, logWarn } from '../utils/logger';

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
    logWarn('Equipment authentication failed: missing API key', { path: req.path });
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
      logWarn('Equipment authentication failed: invalid API key', { path: req.path });
      return res.status(401).json({ message: 'Invalid API key' });
    }

    req.equipamento = equipamento;
    next();
  } catch (error) {
    logError('Error validating equipment API key', error, { path: req.path });
    return res.status(500).json({ message: 'Error validating API key' });
  }
};
