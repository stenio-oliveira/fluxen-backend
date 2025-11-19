import { prisma } from '..';
import { ClientesFilters, UserFilters } from '../controllers/usuarioController';
import { Usuario } from '../types/Usuario';
import { Prisma } from '@prisma/client';
import { UsuarioPerfil } from '../types/UsuarioPerfil';
import bcrypt from 'bcrypt';

export class UsuarioRepository {

  include = (): Prisma.usuarioInclude => {
    return {
      usuario_perfil: { include: { perfil: true } },
    };
  };

  format = (usuario: any): Usuario => {
    return {
      ...usuario,
      perfil_nome: usuario.usuario_perfil?.[0]?.perfil?.nome,
    };
  };

  async findAll(filters?: UserFilters, tx?: Prisma.TransactionClient): Promise<Usuario[]> {
    if (tx) {
      const where: Prisma.usuarioWhereInput = filters
        ? {
          AND: [
            this.buildGeneralFilter(filters.generalFilter),
            this.buildColumnFilters(filters.columnFilters),
          ],
        }
        : {};

      const usuarios = await tx.usuario.findMany({
        where,
        include: this.include(),
        orderBy: {
          id: 'desc'
        }
      });
      return usuarios.map(usuario => this.format(usuario));
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const where: Prisma.usuarioWhereInput = filters
        ? {
          AND: [
            this.buildGeneralFilter(filters.generalFilter),
            this.buildColumnFilters(filters.columnFilters),
          ],
        }
        : {};

      const usuarios = await tx.usuario.findMany({
        where,
        include: this.include(),
        orderBy: {
          id: 'desc'
        }
      });
      return usuarios.map(usuario => this.format(usuario));
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
        const usuario = await tx.usuario.findFirst({ where: { email }, include: this.include() });
        return usuario ? this.format(usuario) : null;
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
            cliente: {
              include: {
                usuario: {
                  include: this.include(),
                },
              },
            },
          },
        });
        return equip?.cliente?.usuario ? this.format(equip.cliente.usuario) : null;
      }
    );
    return user;
  }

  async findById(id: number): Promise<Usuario | null> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario = await tx.usuario.findUnique({ where: { id }, include: this.include() });
      return usuario ? this.format(usuario) : null;
    });
  }

  async findProfileList(id: number, tx?: Prisma.TransactionClient): Promise<UsuarioPerfil[]> {
    try {
      if (tx) {
        return await tx.usuario_perfil.findMany({ where: { id_usuario: id }, include: { perfil: true } });
      }

      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        return tx.usuario_perfil.findMany({ where: { id_usuario: id }, include: { perfil: true } });
      });
    } catch (error) {
      throw error;
    }
  }

  async create(data: Usuario & { id_perfil?: number }, tx?: Prisma.TransactionClient): Promise<Usuario> {
    if (tx) {
      data.senha = await bcrypt.hash(data.senha, 10);
      const { id_perfil, ...rest } = data;
      const newUser = await tx.usuario.create({
        data: {
          ...rest,
        },
        include: this.include()
      });
      if (data.id_perfil) {
        await tx.usuario_perfil.create({ data: { id_perfil: data.id_perfil, id_usuario: newUser.id } });
      }
      return this.format(newUser);
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      data.senha = await bcrypt.hash(data.senha, 10);
      const { id_perfil, ...rest } = data;
      const newUser = await tx.usuario.create({
        data: {
          ...rest,
        },
        include: this.include()
      });
      // Se um perfil foi especificado, criar o vínculo
      if (data.id_perfil) {
        await tx.usuario_perfil.create({
          data: {
            id_perfil: data.id_perfil,
            id_usuario: newUser.id,
          },
        });
      }

      return this.format(newUser);
    });
  }

  async update(id: number, data: Partial<Usuario>, tx?: Prisma.TransactionClient): Promise<Usuario> {
    if (tx) {
      const usuario = await tx.usuario.update({ where: { id }, data, include: this.include() });
      return this.format(usuario);
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario = await tx.usuario.update({ where: { id }, data, include: this.include() });
      return this.format(usuario);
    });
  }

  async isResponsable(id_usuario: number, tx?: Prisma.TransactionClient): Promise<boolean> {
    if (tx) {
      const usuario_perfil = await tx.usuario_perfil.findFirst({ where: { id_usuario, id_perfil: 2 } });
      return usuario_perfil ? true : false;
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario_perfil = await tx.usuario_perfil.findFirst({ where: { id_usuario, id_perfil: 2 } });
      return usuario_perfil ? true : false;
    });
  }

  async isAdmin(id_usuario: number, tx?: Prisma.TransactionClient): Promise<boolean> {
    if (tx) {
      const usuario_perfil = await tx.usuario_perfil.findFirst({ where: { id_usuario, id_perfil: 1 } });
      return usuario_perfil ? true : false;
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario_perfil = await tx.usuario_perfil.findFirst({ where: { id_usuario, id_perfil: 1 } });
      return usuario_perfil ? true : false;
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usuario.delete({ where: { id } });
    });
  }
}
