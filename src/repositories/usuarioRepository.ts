import { prisma } from '..';
import { ClientesFilters } from '../controllers/usuarioController';
import { Usuario } from '../types/Usuario';
import { Prisma } from '@prisma/client';
import { UsuarioPerfil } from '../types/UsuarioPerfil';

export class UsuarioRepository {
  async findAll(): Promise<Usuario[]> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario.findMany();
    });
  }

  async findClientUsers(
    filters?: ClientesFilters,
    tx?: Prisma.TransactionClient
  ): Promise<Usuario[]> {
    if (!tx) {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        

    const where: Prisma.usuarioWhereInput | {} = filters
      ? {
          AND: [
            this.buildGeneralFilter(filters.generalFilter),
            this.buildColumnFilters(filters.columnFilters),
          ],
        }
      : {};

    console.log("where", where);
        return tx.usuario.findMany({
          where: {
            ...where,
            usuario_perfil: { some: { id_perfil: { equals: 2 } } },
          },
        });
      });
    }

    return tx.usuario.findMany({
      where: {
        usuario_perfil: { some: { id_perfil: { equals: 2 } } },
      },
    });
  }

  buildColumnFilters = (columnFilters: {
    id: string | null;
    email: string | null;
    username: string | null;
    nome: string | null;
  }): Prisma.usuarioWhereInput => {
    const where: Prisma.usuarioWhereInput = {};
    if (!columnFilters) return where;
    if (columnFilters.id && !isNaN(parseInt(columnFilters.id))) {
      where.id = parseInt(columnFilters.id);
    }
    if (columnFilters.email && columnFilters?.email !== "") {
      where.email = { contains: columnFilters.email };
    }
    if (columnFilters.username && columnFilters?.username !== "") {
      where.username = { contains: columnFilters.username };
    }
    if (columnFilters.nome && columnFilters?.nome !== "") {
      where.nome = { contains: columnFilters.nome };
    }
    return where;
  };

  buildGeneralFilter = (generalFilter: string): Prisma.usuarioWhereInput => {
    if (!generalFilter || generalFilter.trim().length === 0) return {};
    return {
      OR: [
        { email: { contains: generalFilter } },
        { username: { contains: generalFilter } },
        { nome: { contains: generalFilter } },
      ],
    };
  };

  async findByEmail(email: string): Promise<Usuario | null> {
    const user = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.usuario.findFirst({ where: { email } });
      }
    );
    return user;
  }

  async findByEquipamentoId(id_equipamento: number): Promise<Usuario | null> {
    const user = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const equip = await tx.equipamento.findFirst({
          where: { id: id_equipamento },
          include: {
            usuario: true,
          },
        });
        return equip?.usuario || null;
      }
    );
    return user;
  }

  async findById(id: number): Promise<Usuario | null> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario.findUnique({ where: { id },   });
    });
  }

  async findProfileList(id: number): Promise<UsuarioPerfil[]> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario_perfil.findMany({ where: { id_usuario: id }, include: { perfil: true } });
    });
  }

  async create(data: Usuario): Promise<Usuario> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario.create({ data });
    });
  }

  async createClient (data: Usuario, tx?: Prisma.TransactionClient): Promise<Usuario> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.usuario.create({ data });
      const newUserPerfil = await tx.usuario_perfil.create({
        data: {
          id_perfil: 2,
          id_usuario: newUser.id,
        },
      });
      console.log('createClient: ', { 
        newUser,
        newUserPerfil
      })
      return newUser;
    });
  }

  async update(id: number, data: Partial<Usuario>): Promise<Usuario> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.usuario.update({ where: { id }, data });
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usuario.delete({ where: { id } });
    });
  }
}
