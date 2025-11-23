import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { Equipamento } from '../types/Equipamento';
import { EquipmentFilters } from '../controllers/equipamentoController';

export class EquipamentoRepository {

  findByAdministratorUser = async (userId : number, filters: EquipmentFilters, tx?: Prisma.TransactionClient) => { 
    const { generalFilter, columnFilters } = filters;
    const executor = tx || prisma;
    const where: Prisma.equipamentoWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
        { 
          cliente : { 
            id_administrador : userId,
          }
        }
      ],
    };
    return executor.equipamento.findMany({
      include: this.include(),
      where,
      orderBy: {
        id: 'desc'
      }
    }).then(this.formatArray);
  }

  findByResponsableUser = async (
    userId: number,
    filters: EquipmentFilters,
    tx?: Prisma.TransactionClient
  ): Promise<Equipamento[] | void[]> => {
    const { generalFilter, columnFilters } = filters;
    const client = await prisma.cliente.findFirst({ where: { id_responsavel: userId } });
    const where: Prisma.equipamentoWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
        { 
          cliente : { 
            id_responsavel : userId,
          }
        }
      ],
    };

    if (tx) {
      return tx.equipamento
        .findMany({
          include: this.include(),
          where,
          orderBy: {
            id: 'desc'
          }
        })
        .then(this.formatArray);
    }

    return prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.equipamento
          .findMany({
            include: this.include(),
            where,
            orderBy: {
              id: 'desc'
            }
          })
          .then(this.formatArray);
      }
    );
  };

  findAll = async (
    filters: EquipmentFilters,
    tx?: Prisma.TransactionClient
  ): Promise<Equipamento[] | void[]> => {
    const { generalFilter, columnFilters } = filters;
    const where: Prisma.equipamentoWhereInput = {
      AND: [
        this.buildGeneralFilter(generalFilter),
        this.buildColumnFilters(columnFilters),
      ],
    };

    if (tx) {
      return tx.equipamento
        .findMany({
          include: this.include(),
          where,
          orderBy: {
            id: 'desc'
          }
        })
        .then(this.formatArray);
    }

    return prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return tx.equipamento
          .findMany({
            include: this.include(),
            where,
            orderBy: {
              id: 'desc'
            }
          })
          .then(this.formatArray);
      }
    );
  };

  include = (): Prisma.equipamentoInclude => {
    return {
      cliente: {
        include: {
          usuario_responsavel: true,
        },
      },
    };
  };

  findById = async (id: number, tx?: Prisma.TransactionClient): Promise<Equipamento | null> => {
    if (tx) {
      return tx.equipamento
        .findUnique({ where: { id }, include: this.include() })
        .then((equipamento) => this.format(equipamento));
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento
        .findUnique({ where: { id }, include: this.include() })
        .then((equipamento) => this.format(equipamento));
    });
  };

  create = async (data: Partial<Equipamento>, tx?: Prisma.TransactionClient): Promise<Equipamento | null> => {
    // Gerar API key automaticamente
    const generateApiKey = (equipamentoId: number): string => {
      return `eq_${equipamentoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    if (tx) {
      return tx.equipamento
        .create({
          data: {
            nome: data.nome || '',
            id_cliente: data.id_cliente,
            api_key: null, // Será atualizado após a criação
          },
          include: this.include(),
        })
        .then(async (equipamento) => {
          // Gerar e atualizar a API key
          const apiKey = generateApiKey(equipamento.id);
          const updatedEquipamento = await tx.equipamento.update({
            where: { id: equipamento.id },
            data: { api_key: apiKey },
            include: this.include(),
          });
          return this.format(updatedEquipamento);
        });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento
        .create({
          data: {
            nome: data.nome || '',
            id_cliente: data.id_cliente,
            api_key: null, // Será atualizado após a criação
          },
          include: this.include(),
        })
        .then(async (equipamento) => {
          // Gerar e atualizar a API key
          const apiKey = generateApiKey(equipamento.id);
          const updatedEquipamento = await tx.equipamento.update({
            where: { id: equipamento.id },
            data: { api_key: apiKey },
            include: this.include(),
          });
          return this.format(updatedEquipamento);
        });
    });
  };

  update = async (id: number, data: any, tx?: Prisma.TransactionClient): Promise<Equipamento> => {
    if (tx) {
      return tx.equipamento
        .update({ where: { id }, data, include: this.include() })
        .then(this.format);
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento
        .update({ where: { id }, data, include: this.include() })
        .then(this.format);
    });
  };

  delete = async (id: number, tx?: Prisma.TransactionClient): Promise<void> => {
    if (tx) {
      await tx.equipamento.delete({ where: { id } });
      return;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.equipamento.delete({ where: { id } });
    });
  };

  buildGeneralFilter = (
    generalFilter: string
  ): Prisma.equipamentoWhereInput => {
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

