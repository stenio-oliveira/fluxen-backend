import { prisma } from '../database';
import { Prisma } from '@prisma/client';

export interface PasswordResetAudit {
  id: number;
  id_usuario: number;
  senha_hash_anterior: string;
  senha_hash_atual: string;
  created_at: Date | null;
}

export class PasswordResetAuditRepository {
  async create(data: {
    id_usuario: number;
    senha_hash_anterior: string;
    senha_hash_atual: string;
  }, transaction?: Prisma.TransactionClient): Promise<PasswordResetAudit> {
    const executor = transaction ?? prisma;
    return executor.password_reset_audit.create({
      data,
    }) as Promise<PasswordResetAudit>;
  }

  async findByUserId(id_usuario: number): Promise<PasswordResetAudit[]> {
    return prisma.password_reset_audit.findMany({
      where: { id_usuario },
      orderBy: { created_at: 'desc' },
    }) as Promise<PasswordResetAudit[]>;
  }

  async findAll(): Promise<PasswordResetAudit[]> {
    return prisma.password_reset_audit.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    }) as Promise<PasswordResetAudit[]>;
  }
}

