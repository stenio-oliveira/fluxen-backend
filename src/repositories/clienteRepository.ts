import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { Cliente } from '../types/Cliente';

export interface ClienteFilters {
  columnFilters?: {
    id: string;
    nome: string;
    cnpj: string;
    responsavel_nome: string;
  };
  generalFilter: string;
}

export class ClienteRepository {

  findByResponsableUser = async (
    userId: number,
    filters: ClienteFilters
  ): Promise<Cliente[] | void[]> => {
    const { generalFilter, columnFilters } = filters;
    const where: Prisma.clienteWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
        { 
          id_responsavel: userId,
        }
      ],
    };
    const clientes = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.cliente
          .findMany({
            include: this.include(),
            where,
          })
          .then(this.formatArray);
      }
    );
    return clientes;
  };

  findAll = async (
    filters: ClienteFilters
  ): Promise<Cliente[] | void[]> => {
    const { generalFilter, columnFilters } = filters;
    const where: Prisma.clienteWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
      ],
    };
    const clientes = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.cliente
          .findMany({
            include: this.include(),
            where,
          })
          .then(this.formatArray);
      }
    );

    return clientes;
  };

  include = (): Prisma.clienteInclude => {
    return {
      usuario: true,
    };
  };

  findById = async (id: number): Promise<Cliente | null> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.cliente
        .findUnique({ where: { id }, include: this.include() })
        .then((cliente) => this.format(cliente));
    });
  };

  create = async (data: Partial<Cliente>): Promise<Cliente | null> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { nome, cnpj, id_responsavel } = data;
      if (!nome || nome === "") {
        throw new Error(`Erro ao criar cliente: nome é obrigatório`);
      }
      return tx.cliente
        .create({
          data: {
            id: data.id || 0, // Prisma vai gerar automaticamente se não fornecido
            nome: nome,
            cnpj: cnpj || null,
            id_responsavel: id_responsavel || null,
          },
          include: this.include(),
        })
        .then((cliente) => this.format(cliente));
    });
  };

  update = async (id: number, data: any): Promise<Cliente> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.cliente
        .update({ where: { id }, data, include: this.include() })
        .then(this.format);
    });
  };

  delete = async (id: number): Promise<void> => {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.cliente.delete({ where: { id } });
    });
  };

  buildGeneralFilter = (
    generalFilter: string
  ): Prisma.clienteWhereInput => {
    console.log("generalFilter", generalFilter);
    if (!generalFilter || generalFilter === "") return {};
    return {
      OR: [
        {
          nome: {
            contains: generalFilter,
          },
        },
        {
          cnpj: {
            contains: generalFilter,
          },
        },
        {
          usuario: {
            OR: [
              { nome: { contains: generalFilter } },
              { email: { contains: generalFilter } },
              { username: { contains: generalFilter } }
            ],
          },
        },
      ],
    };
  };

  buildColumnFilters = (
    columnFilters: ClienteFilters["columnFilters"]
  ): Prisma.clienteWhereInput => {
    if (!columnFilters) return {};

    const filters: Prisma.clienteWhereInput = {};
    if (columnFilters?.id && !isNaN(parseInt(columnFilters.id))) {
      filters.id = { equals: parseInt(columnFilters.id) };
    }
    if (columnFilters?.nome && columnFilters?.nome !== "") {
      filters.nome = { contains: columnFilters.nome };
    }
    if (columnFilters?.cnpj && columnFilters?.cnpj !== "") {
      filters.cnpj = { contains: columnFilters.cnpj };
    }
    if (columnFilters?.responsavel_nome && columnFilters?.responsavel_nome !== "") {
      filters.usuario = {
        OR: [
          { nome: { contains: columnFilters.responsavel_nome } },
          { email: { contains: columnFilters.responsavel_nome } },
          { username: { contains: columnFilters.responsavel_nome } }
        ],
      };
    }
    return filters;
  };

  format = (cliente: Cliente | any): Cliente => {
    return {
      ...cliente,
      responsavel_nome: cliente.usuario?.nome,
    };
  };

  formatArray = (clientes: any[]): Cliente[] =>
    clientes.map((cliente) => this.format(cliente));
}
