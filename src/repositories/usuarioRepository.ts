import { prisma } from '..';
import { ClientesFilters, UserFilters } from '../controllers/usuarioController';
import { CreateUserDTO, Usuario } from '../types/Usuario';
import { Prisma } from '@prisma/client';
import { UsuarioPerfil } from '../types/UsuarioPerfil';
import bcrypt from 'bcrypt';

export class UsuarioRepository {

  include = (): Prisma.usuarioInclude => {
    return {
      usuario_perfil: { include: { perfil: true } },
    };
  };

  format = async (usuario: any): Promise<Usuario> => {
    // Verificar se o usuário é gestor (tem perfil de gestor em algum cliente)
    const isGestor = usuario.id ? await this.isManager(usuario.id) : false;
    const isResponsavel = usuario.id ? await this.isResponsable(usuario.id) : false;
    const isAdministrador = usuario.id ? await this.isAdmin(usuario.id) : false;
    return {
      ...usuario,
      perfil_nome: usuario.usuario_perfil?.[0]?.perfil?.nome,
      is_gestor: isGestor,
      is_responsavel: isResponsavel,
      is_administrador: isAdministrador,
    };
  };

  async findAll(filters?: UserFilters, tx?: Prisma.TransactionClient): Promise<Usuario[]> {
    console.log("findAll usuarios")
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
      return Promise.all(usuarios.map(usuario => this.format(usuario)));
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
      return Promise.all(usuarios.map(usuario => this.format(usuario)));
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
    const usuario = await prisma.usuario.findFirst({ where: { email }, include: this.include() });
    return usuario ? await this.format(usuario) : null;
  }

  async findByEquipamentoId(id_equipamento: number): Promise<Usuario | null> {
    // Por enquanto, não retornamos responsável pois um cliente pode ter múltiplos responsáveis
    // Esta funcionalidade será implementada posteriormente
    return null;
  }

  async findById(id: number): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({ where: { id }, include: this.include() });
    return usuario ? await this.format(usuario) : null;
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

  async create(data: Partial<CreateUserDTO>, tx?: Prisma.TransactionClient): Promise<Usuario> {
    const executor = tx || prisma;
    const { nome, email, senha, username, id_perfil } = data;
    const newUser = await executor.usuario.create({
      data: {
        nome: nome || '',
        email: email || '',
        senha: senha || '',
        username: username || '',
      },
    });
    return await this.format(newUser);
  }

  async update(id: number, data: Partial<Usuario>, tx?: Prisma.TransactionClient): Promise<Usuario> {
    if (tx) {
      const usuario = await tx.usuario.update({ where: { id }, data, include: this.include() });
      return await this.format(usuario);
    }
    const usuario = await prisma.usuario.update({ where: { id }, data, include: this.include() });
    return await this.format(usuario);
  }

  async isResponsable(id_usuario: number, tx?: Prisma.TransactionClient): Promise<boolean> {
    const executor = tx || prisma;
    return executor.usuario_perfil_cliente.findFirst({ where: { id_usuario, id_perfil: 2 } }).then(usuario_perfil_cliente => usuario_perfil_cliente ? true : false);
  }

  async isAdmin(id_usuario: number, tx?: Prisma.TransactionClient): Promise<boolean> {
    const executor = tx || prisma;
    return executor.usuario_perfil.findFirst({ where: { id_usuario, id_perfil: 1 } }).then(usuario_perfil => usuario_perfil ? true : false);
  }

  async isManager(id_usuario: number, tx?: Prisma.TransactionClient): Promise<boolean> {
   const executor = tx || prisma;
   return executor.usuario_perfil_cliente.findFirst({ where: { id_usuario, id_perfil: 3 } }).then(usuario_perfil_cliente => usuario_perfil_cliente ? true : false);
  }

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usuario.delete({ where: { id } });
    });
  }
}
