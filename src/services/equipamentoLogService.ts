import { EquipamentoLogRepository } from "../repositories/equipamentoLogRepository";
import { EquipamentoLog } from "../types/EquipamentoLog";
import { EquipamentoMetricaRepository } from "../repositories/equipamentoMetricaRepository";
import { EquipamentoMetrica } from "../types/EquipamentoMetrica";
import { prisma } from "..";
import { Prisma } from "@prisma/client";
import { CreateEquipamentoLogsDTO } from "../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO";
export class EquipamentoLogService {
  private equipamentoLogRepository = new EquipamentoLogRepository();
  private equipamentoMetricaRepository = new EquipamentoMetricaRepository();
  async getEquipamentoLogs(): Promise<EquipamentoLog[]> {
    return this.equipamentoLogRepository.findAll();
  }

  async getEquipamentoLogById(id: number): Promise<EquipamentoLog | null> {
    return this.equipamentoLogRepository.findById(id);
  }

  async createManyEquipamentoLogs(
    data: CreateEquipamentoLogsDTO
  ): Promise<EquipamentoLog[]> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const equipamentoId = data.logs[0].id_equipamento;

      if (!equipamentoId) return [];
      const equipamentoMetricas =
        await this.equipamentoMetricaRepository.findByEquipamentoId(
          equipamentoId,
          tx
        );
      const metricaToEquipamentoMetrica = new Map<number, EquipamentoMetrica>();
      //mapeando equipamentoMetrica (que contém informações para conversão) para cada métrica em cada log
      for (const equipamentoMetrica of equipamentoMetricas) {
        metricaToEquipamentoMetrica.set(
          equipamentoMetrica.id_metrica,
          equipamentoMetrica
        );
      }
      for (const log of data.logs) {
        const equipamentoMetrica = metricaToEquipamentoMetrica.get(
          log.id_metrica || 0
        );
        if (equipamentoMetrica) {
          const reference = 4096;
          const { valor } = log; //valor vai vir cru (na unidade que vai de 0 a 4096)
          const { valor_minimo, valor_maximo } = equipamentoMetrica; //baseado nessa unidade, fazer regra de tres
          log.valor_convertido =
            ((Number(valor) - reference) * (valor_maximo - valor_minimo)) /
              (reference - 0) +
            valor_minimo;
          log.id_equipamento_metrica = equipamentoMetrica.id;
        }
      }
      const logsCreated = await this.equipamentoLogRepository.createMany(
        data.logs as EquipamentoLog[],
        tx
      );
      if (!logsCreated) {
        throw new Error('Failed to create logs');
      }
      
      // Retornar os logs criados
      return this.equipamentoLogRepository.findByEquipamentoId(equipamentoId);
    });
  }

  async createEquipamentoLog(data: EquipamentoLog): Promise<EquipamentoLog> {
    return this.equipamentoLogRepository.create(data);
  }

  async updateEquipamentoLog(
    id: number,
    data: Partial<EquipamentoLog>
  ): Promise<EquipamentoLog> {
    return this.equipamentoLogRepository.update(id, data);
  }

  async deleteEquipamentoLog(id: number): Promise<void> {
    await this.equipamentoLogRepository.delete(id);
  }
}
