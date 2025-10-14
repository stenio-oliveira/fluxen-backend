import { prisma } from '../index';
import { EquipamentoLog } from '../types/EquipamentoLog';
import { Prisma } from '@prisma/client';

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

  async create(data: EquipamentoLog, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog> {

    if(transaction){ 
      return transaction.equipamento_log.create({ data });
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.create({ data });
    });
  }

  async createMany(data: EquipamentoLog[], transaction? : Prisma.TransactionClient): Promise<boolean> {
    if(transaction){ 
      console.log("payload: ", data)
     const batchPayload =  await transaction.equipamento_log.createMany({ data });
     if (batchPayload.count !== data.length) return false;
     return true;
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
       const batchPayload = await tx.equipamento_log.createMany({ data });
       if(batchPayload.count !== data.length) return false;
       return true;
    });
  }

  async findByEquipamentoId(id_equipamento: number, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog[]> {
    if(transaction){ 
      return transaction.equipamento_log.findMany({ where: { id_equipamento } });
    }
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.equipamento_log.findMany({ where: { id_equipamento } });
    });
  }

  async update(id: number, data: Partial<EquipamentoLog>, transaction? : Prisma.TransactionClient): Promise<EquipamentoLog> {

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
}


