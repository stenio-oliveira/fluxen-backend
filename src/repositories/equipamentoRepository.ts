import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { Equipamento } from '../types/Equipamento';
import { EquipmentFilters } from '../controllers/equipamentoController';

export class EquipamentoRepository {
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
    console.log("generalFilter", this.buildGeneralFilter(generalFilter));
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
      usuario: true,
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
            id_usuario: Number(id_usuario),
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
          usuario: {
            OR: [
              { nome: { contains: generalFilter } },
              { email: { contains: generalFilter } },
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
      filters.usuario = {
        OR: [{ nome: { contains: columnFilters.cliente_nome } }],
      };
    }
    return filters;
  };

  format = (equipamento: Equipamento | any): Equipamento => {
    return {
      ...equipamento,
      cliente: equipamento.usuario,
      cliente_nome: equipamento.usuario?.nome,
    };
  };

  formatArray = (equipamentos: any[]): Equipamento[] =>
    equipamentos.map((equipamento) => this.format(equipamento));
}

