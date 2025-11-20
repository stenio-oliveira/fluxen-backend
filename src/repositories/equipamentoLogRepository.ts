import { prisma } from '../index';
import { Prisma } from '@prisma/client';
import { EquipamentoLogGrupo } from '../types/EquipamentoLogGrupo';

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

  async findGroupedByTimestamp(id_equipamento: number, transaction? : Prisma.TransactionClient): Promise<any[]> {
    if(transaction){ 
      const logsByGroups = await transaction.equipamento_log_grupo.findMany({
        where: { id_equipamento },
        orderBy: {
          timestamp: 'desc'
        }
      });
       return logsByGroups;
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const logsByGroups = await tx.equipamento_log_grupo.findMany({
        where: { id_equipamento },
        orderBy: {
          timestamp: 'desc'
        }
      });
       return logsByGroups;
    });
  }
    
}


