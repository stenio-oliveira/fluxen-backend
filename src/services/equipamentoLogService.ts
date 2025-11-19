import { EquipamentoLogRepository } from "../repositories/equipamentoLogRepository";
import { EquipamentoLog } from "../types/EquipamentoLog";
import { EquipamentoMetricaRepository } from "../repositories/equipamentoMetricaRepository";
import { EquipamentoMetrica } from "../types/EquipamentoMetrica";
import { prisma } from "..";
import { Prisma } from "@prisma/client";
import { CreateEquipamentoLogDTO, CreateEquipamentoLogsDTO } from "../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO";
import { UpdateEquipamentoLogDTO } from "../dto/HttpRequestDTOS/UpdateEquipamentoLogDTO";
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
      const newGroup = await this.equipamentoLogRepository.createGroup(equipamentoId ,tx);
      data.logs.forEach(log => {
        log.id_grupo = newGroup.id;

      });
      //mapeando equipamentoMetrica (que contém informações para conversão) para cada métrica em cada log
      for (const equipamentoMetrica of equipamentoMetricas) {
        metricaToEquipamentoMetrica.set(
          equipamentoMetrica.id_metrica || 0,
          equipamentoMetrica
        );
      }
      for (const log of data.logs) {
        const equipamentoMetrica = metricaToEquipamentoMetrica.get(
          log.id_metrica || 0
        );
        if (equipamentoMetrica) {
          const range_original_min = 0;
          const range_original_max = 4096;
          const { valor } = log;
          const { valor_minimo, valor_maximo } = equipamentoMetrica;

          // Verificar se valor_convertido já foi fornecido
          if (log.valor_convertido === undefined || log.valor_convertido === null) {
          // Se valor_convertido não foi fornecido, calcular usando regra de 3
            log.valor_convertido =
              ((Number(valor) - range_original_min) * (valor_maximo - valor_minimo)) /
              (range_original_max - range_original_min) +
              valor_minimo;
          }

          log.id_equipamento_metrica = equipamentoMetrica.id;

          // Se não foi fornecido timestamp, usar o atual
          if (!log.timestamp) {
            log.timestamp = new Date();
          }
        }
      }
      const logsCreated = await this.equipamentoLogRepository.createMany(
        data.logs,
        tx
      );
      if (!logsCreated) {
        throw new Error('Failed to create logs');
      }
      
      // Retornar os todos os logs
      return this.equipamentoLogRepository.findByEquipamentoId(equipamentoId, tx);
    });
  }

  async createEquipamentoLog(data: CreateEquipamentoLogDTO): Promise<EquipamentoLog> {
    return this.equipamentoLogRepository.create(data);
  }

  async updateEquipamentoLog(
    id: number,
    data: UpdateEquipamentoLogDTO
  ): Promise<EquipamentoLog> {
    return this.equipamentoLogRepository.update(id, data);
  }

  async deleteEquipamentoLog(id: number): Promise<void> {
    await this.equipamentoLogRepository.delete(id);
  }

  private getSituation(groupedLogs: any[]): 'working' | 'frozen' {
    if (!Array.isArray(groupedLogs) || groupedLogs.length < 5) return 'working';
    const lastFiveLogs = groupedLogs.slice(0, 5);
    // Criar cópias sanitizadas sem timestamp e id dos equipamento_log
    const sanitizedLogs = lastFiveLogs.map((log) => {
      const { timestamp, id, equipamento_log, ...rest } = log;
      // Sanitizar equipamento_log removendo id
      const sanitizedEquipamentoLog = Array.isArray(equipamento_log)
        ? equipamento_log.map((logItem: any) => {
          const { id: logId, timestamp: logTimestamp, id_grupo, ...logRest } = logItem;
          return logRest;
        })
        : equipamento_log
      return {
        ...rest,
        equipamento_log: sanitizedEquipamentoLog
      };
    });
    const allEqual = sanitizedLogs.every((log) => {
      return JSON.stringify(log) === JSON.stringify(sanitizedLogs[0]);
    })
    return allEqual ? 'frozen' : 'working';
  }

  private checkValueLimits(value: number, metricId: number, metrics: any[]): 'min' | 'max' | 'none' {
    const metric = metrics.find(m => m.id_metrica === metricId);
    if (!metric || !metric.valor_maximo) return 'none';

    const range = metric.valor_maximo - metric.valor_minimo;
    const threshold = range * 0.1; // 10% da faixa como limite de alerta
    if (value <= metric.valor_minimo + threshold) {
      return 'min';
    }

    if (value >= metric.valor_maximo - threshold) {
      return 'max';
    }

    return 'none';
  }

  async getLogsTableData(id_equipamento: number): Promise<any> {
    const metrics = await this.equipamentoMetricaRepository.findByEquipamentoId(id_equipamento);
    const groupedLogs = await this.equipamentoLogRepository.findGroupedByTimestamp(id_equipamento);
    // Create timestamp column
    const columnsArray = [
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        flex: 1,
        disableColumnMenu: true,
        type: 'dateTime'
      }
    ];
    // Add metric columns
    metrics.forEach((metric) => {
      if (metric.metrica?.nome) {
        columnsArray.push({
          field: `metrica_${metric.id_metrica}`,
          headerName: `${metric.metrica.nome} (${metric.metrica.unidade})`,
          flex: 1,
          disableColumnMenu: true,
          type: 'number'
        });
      }
    });

   for(let group of groupedLogs) {
    for(let log of group.equipamento_log) {
      const alert = this.checkValueLimits(log.valor_convertido, log.id_metrica, metrics);
      group[`metrica_${log.id_metrica}_alert`] = alert;
   }
  }

    let situation: 'working' | 'frozen' = 'working';
    situation = this.getSituation(groupedLogs);
    
    return { 
      columns: columnsArray,
      rows: groupedLogs,
      situation,
      metrics 
    };
  }
}
