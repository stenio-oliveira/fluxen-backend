import { prisma } from '../database';
import { Prisma } from '@prisma/client';

export interface PasswordResetToken {
  id: number;
  id_usuario: number;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date | null;
}

export class PasswordResetTokenRepository {
  async create(data: {
    id_usuario: number;
    token: string;
    expires_at: Date;
  }, transaction?: Prisma.TransactionClient): Promise<PasswordResetToken> {
    const executor = transaction ?? prisma;
    return executor.password_reset_token.create({
      data,
    }) as Promise<PasswordResetToken>;
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.password_reset_token.findUnique({
      where: { token },
      include: {
        usuario: true,
      },
    }) as Promise<PasswordResetToken | null>;
  }

  async markAsUsed(token: string, transaction?: Prisma.TransactionClient): Promise<void> {
    const executor = transaction ?? prisma;
    await executor.password_reset_token.update({
      where: { token },
      data: { used: true },
    });
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await prisma.password_reset_token.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  async deleteByUserId(id_usuario: number, transaction?: Prisma.TransactionClient): Promise<void> {
    const executor = transaction ?? prisma;
    await executor.password_reset_token.deleteMany({
      where: { id_usuario },
    });
  }
}

