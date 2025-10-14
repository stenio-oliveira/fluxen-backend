import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { Perfil } from '../types/Perfil';

export class PerfilRepository {
  async findAll(): Promise<Perfil[]> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.perfil.findMany();
    });
  }

  async findById(id: number): Promise<Perfil | null> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.perfil.findUnique({ where: { id } });
    });
  }

  async create(data: Perfil): Promise<Perfil> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.perfil.create({ data });
    });
  }

  async update(id: number, data: Partial<Perfil>): Promise<Perfil> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.perfil.update({ where: { id }, data });
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.perfil.delete({ where: { id } });
    });
  }
}
