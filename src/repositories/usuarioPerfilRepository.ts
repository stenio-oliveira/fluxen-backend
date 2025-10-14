import { prisma } from '../index';
import { UsuarioPerfil } from '../types/UsuarioPerfil';
import { Prisma } from '@prisma/client';

export class UsuarioPerfilRepository {
  async findAll(): Promise<UsuarioPerfil[]> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario_perfil.findMany();
    });
  }

  async findById(id: number): Promise<UsuarioPerfil | null> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario_perfil.findUnique({ where: { id } });
    });
  }

  async create(data: UsuarioPerfil): Promise<UsuarioPerfil> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario_perfil.create({ data });
    });
  }

  async update(id: number, data: Partial<UsuarioPerfil>): Promise<UsuarioPerfil> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario_perfil.update({ where: { id }, data });
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usuario_perfil.delete({ where: { id } });
    });
  }
}
