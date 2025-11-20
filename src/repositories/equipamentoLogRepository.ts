import { Prisma, PrismaClient } from '@prisma/client';
import { EquipamentoLogGrupo } from '../types/EquipamentoLogGrupo';

// Criar instância própria do Prisma para evitar dependência circular
const prisma = new PrismaClient();

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface GroupedLogsResult {
  groups: EquipamentoLogGrupo[];
  total: number;
}

export class EquipamentoLogRepository {
  async updateGroup(id: number, data: Partial<EquipamentoLogGrupo>, transaction?: Prisma.TransactionClient): Promise<EquipamentoLogGrupo> {
    // Remove 'id' from data if somehow present
    const { id : id_grupo, id_equipamento, timestamp, ...rest} = data as any;
    if (transaction) {
      return transaction.equipamento_log_grupo.update({ where: { id }, data: rest });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log_grupo.update({ where: { id }, data: rest });
    });
  }

  async createGroup( id_equipamento: number, transaction? : Prisma.TransactionClient,): Promise<EquipamentoLogGrupo> {
    if(transaction){ 
      return transaction.equipamento_log_grupo.create({ data: { timestamp: new Date(), id_equipamento } });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log_grupo.create({ data: { timestamp: new Date(), id_equipamento } });
    });
  }

  async findGroupedByTimestamp(
    id_equipamento: number,
    options: PaginationOptions = {},
    transaction?: Prisma.TransactionClient
  ): Promise<GroupedLogsResult> {
    const page = Math.max(options.page ?? 1, 1);
    const pageSize = Math.max(Math.min(options.pageSize ?? 50, 500), 1);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const executor = transaction ?? prisma;

    const [groups, total] = await Promise.all([
      executor.equipamento_log_grupo.findMany({
        where: { id_equipamento },
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take
      }),
      executor.equipamento_log_grupo.count({
        where: { id_equipamento }
      })
    ]);

    return { groups, total };
  }
    
}


