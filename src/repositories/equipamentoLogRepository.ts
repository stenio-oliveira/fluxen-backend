import { CreateEquipamentoLogDTO } from '../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO';
import { UpdateEquipamentoLogDTO } from '../dto/HttpRequestDTOS/UpdateEquipamentoLogDTO';
import { prisma } from '../index';
import { EquipamentoLog } from '../types/EquipamentoLog';
import { Prisma } from '@prisma/client';
import { EquipamentoLogGrupo } from '../types/EquipamentoLogGrupo';

export class EquipamentoLogRepository {
  async findAll(transaction? : Prisma.TransactionClient): Promise<EquipamentoLog[]> {
   if(transaction){ 
     return transaction.equipamento_log.findMany();
   }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.findMany();
    });
  }

  async findById(id: number, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog | null> {

    if(transaction){ 
      return transaction.equipamento_log.findUnique({ where: { id } });
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.findUnique({ where: { id } });
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

  async create(data: CreateEquipamentoLogDTO, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog> {
    if(transaction){ 
      return transaction.equipamento_log.create({ 
      data: { 
        ...data,
        id_equipamento_metrica : data.id_equipamento_metrica || 0,
        timestamp : data.timestamp || new Date(),
      }
      });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.create({ data: { 
        ...data,
        id_equipamento_metrica : data.id_equipamento_metrica || 0,
        timestamp : data.timestamp || new Date(),
      }});
    });
  }

  async createMany(data: CreateEquipamentoLogDTO[], transaction? : Prisma.TransactionClient): Promise<boolean> {
    const processedData = data.map(item => ({
      ...item,
      id_equipamento_metrica: item.id_equipamento_metrica || 0,
      valor_convertido: item.valor_convertido || item.valor,
      timestamp: item.timestamp || new Date(),
    }));

    if (transaction) { 
     const batchPayload =  await transaction.equipamento_log.createMany({ data: processedData });
     if (batchPayload.count !== processedData.length) return false;
     return true;
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
       const batchPayload = await tx.equipamento_log.createMany({ data: processedData });
       if(batchPayload.count !== processedData.length) return false;
       return true;
    });
  }

  async findByEquipamentoId(id_equipamento: number, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog[]> {
    if(transaction){ 
      return transaction.equipamento_log.findMany({ 
        where: { id_equipamento },
        include: {
          metrica: true,
          equipamento_metricas: true
        },
        orderBy: { id: 'desc' }
      });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.findMany({ 
        where: { id_equipamento },
        include: {
          metrica: true,
          equipamento_metricas: true
        },
        orderBy: { id: 'desc' }
      });
    });
  }

  async update(id: number, data: Partial<UpdateEquipamentoLogDTO>, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog> {
    if(transaction){ 
      return transaction.equipamento_log.update({ where: { id }, data });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.update({ where: { id }, data });
    });
  }

  async delete(id: number, transaction? : Prisma.TransactionClient): Promise<boolean> {
    if(transaction){ 
       await transaction.equipamento_log.delete({ where: { id } });
       return true;
    }
     prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.equipamento_log.delete({ where: { id } });
    });
    return true;
  }

  async findGroupedByTimestamp(id_equipamento: number, transaction? : Prisma.TransactionClient): Promise<any[]> {
    if(transaction){ 
      const logsByGroups = await transaction.equipamento_log_grupo.findMany({
        where: { id_equipamento },
        include: {
          equipamento_log: { 
            include: {
              metrica: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })
       .then((groups) => { 
         for(let group of groups){ 
           group.equipamento_log.forEach((log : EquipamentoLog) => { 
             (group as any)[`metrica_${log.id_metrica}`] = log.valor_convertido;
           })
         }
         return groups;
       });
       return logsByGroups;
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const logsByGroups = await tx.equipamento_log_grupo.findMany({
        where: { id_equipamento },
        include: {
          equipamento_log: { 
            include: {
              metrica: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })
       .then((groups) => { 
         
         for(let group of groups){ 
           group.equipamento_log.forEach((log : EquipamentoLog) => { 
             (group as any)[`metrica_${log.id_metrica}`] = log.valor_convertido;
           })
         }
         return groups;
       });
       return logsByGroups;
    });
  }
    
}


