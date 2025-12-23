import { prisma } from '../database';
import { Prisma } from '@prisma/client';

export interface UsuarioPerfilCliente {
  id: number;
  id_usuario: number;
  id_cliente: number;
  id_perfil: number;
}

export class UsuarioPerfilClienteRepository {
  async findByUsuarioId(id_usuario: number): Promise<any[]> {
    return prisma.usuario_perfil_cliente.findMany({
      where: { id_usuario },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
          },
        },
        perfil: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async findByClienteId(id_cliente: number): Promise<any[]> {
    return prisma.usuario_perfil_cliente.findMany({
      where: { id_cliente },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            username: true,
          },
        },
        perfil: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async deleteByClienteId(id_cliente: number): Promise<void> {
    await prisma.usuario_perfil_cliente.deleteMany({
      where: { id_cliente },
    });
  }

  async create(data: {
    id_usuario: number;
    id_cliente: number;
    id_perfil: number;
  }): Promise<UsuarioPerfilCliente> {
    return prisma.usuario_perfil_cliente.create({
      data,
    }) as any;
  }

  async delete(id: number): Promise<void> {
    await prisma.usuario_perfil_cliente.delete({
      where: { id },
    });
  }

  async deleteByUsuarioAndClienteAndPerfil(
    id_usuario: number,
    id_cliente: number,
    id_perfil: number
  ): Promise<void> {
    await prisma.usuario_perfil_cliente.deleteMany({
      where: {
        id_usuario,
        id_cliente,
        id_perfil,
      },
    });
  }

  async deleteAllByUsuario(id_usuario: number): Promise<void> {
    await prisma.usuario_perfil_cliente.deleteMany({
      where: { id_usuario },
    });
  }

  async findByUsuarioAndClienteAndPerfil(
    id_usuario: number,
    id_cliente: number,
    id_perfil: number
  ): Promise<UsuarioPerfilCliente | null> {
    return prisma.usuario_perfil_cliente.findFirst({
      where: {
        id_usuario,
        id_cliente,
        id_perfil,
      },
    }) as any;
  }
}

