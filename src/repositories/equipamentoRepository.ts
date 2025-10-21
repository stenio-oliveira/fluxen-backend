import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { Equipamento } from '../types/Equipamento';
import { EquipmentFilters } from '../controllers/equipamentoController';

export class EquipamentoRepository {

  findByResponsableUser = async (
    userId: number,
    filters: EquipmentFilters
  ): Promise<Equipamento[] | void[]> => {
    const { generalFilter, columnFilters } = filters;
    const client = await prisma.cliente.findFirst({ where: { id_responsavel: userId } });
    const where: Prisma.equipamentoWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
        { 
          id_cliente: client?.id,
        }
      ],
    };
    const equips = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.equipamento
          .findMany({
            include: this.include(),
            where,
          })
          .then(this.formatArray);
      }
    );
    return equips;
  };

  findAll = async (
    filters: EquipmentFilters
  ): Promise<Equipamento[] | void[]> => {
    const { generalFilter, columnFilters } = filters;
    const where: Prisma.equipamentoWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
      ],
    };
    const equips = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.equipamento
          .findMany({
            include: this.include(),
            where,
          })
          .then(this.formatArray);
      }
    );

    return equips;
  };

  include = (): Prisma.equipamentoInclude => {
    return {
      cliente: true,
    };
  };

  findById = async (id: number): Promise<Equipamento | null> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento
        .findUnique({ where: { id }, include: this.include() })
        .then((equipamento) => this.format(equipamento));
    });
  };

  create = async (data: Partial<Equipamento>): Promise<Equipamento | null> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { nome, id_usuario } = data;
      if (!id_usuario || !nome || nome === "") {
        throw new Error(`Erro ao criar equipamento: dados insuficientes`);
      }
      return tx.equipamento
        .create({
          data: {
            nome: nome,
            id_cliente: Number(id_usuario),
          },
          include: this.include(),
        })
        .then((equipamento) => this.format(equipamento));
    });
  };

  update = async (id: number, data: any): Promise<Equipamento> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento
        .update({ where: { id }, data, include: this.include() })
        .then(this.format);
    });
    // return prisma.equipamento.update({ where: { id }, data });
  };

  delete = async (id: number): Promise<void> => {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.equipamento.delete({ where: { id } });
    });
  };

  buildGeneralFilter = (
    generalFilter: string
  ): Prisma.equipamentoWhereInput => {
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
          cliente: {
            OR: [
              { nome: { contains: generalFilter } }
            ],
          },
        },
      ],
    };
  };

  buildColumnFilters = (
    columnFilters: EquipmentFilters["columnFilters"]
  ): Prisma.equipamentoWhereInput => {
    if (!columnFilters) return {};

    const filters: Prisma.equipamentoWhereInput = {};
    if (columnFilters?.id && !isNaN(parseInt(columnFilters.id))) {
      filters.id = { equals: parseInt(columnFilters.id) };
    }
    if (columnFilters?.nome && columnFilters?.nome !== "") {
      filters.nome = { contains: columnFilters.nome };
    }
    if (columnFilters?.cliente_nome && columnFilters?.cliente_nome !== "") {
      filters.cliente = {
        OR: [{ nome: { contains: columnFilters.cliente_nome } }],
      };
    }
    return filters;
  };

  format = (equipamento: Equipamento | any): Equipamento => {
    return {
      ...equipamento,
      cliente: equipamento.cliente,
      cliente_nome: equipamento.cliente?.nome,
    };
  };

  formatArray = (equipamentos: any[]): Equipamento[] =>
    equipamentos.map((equipamento) => this.format(equipamento));
}

