import { EquipamentoLogRepository } from "../repositories/equipamentoLogRepository";
import { EquipamentoMetricaRepository } from "../repositories/equipamentoMetricaRepository";
import { EquipamentoMetrica } from "../types/EquipamentoMetrica";
import { prisma } from "..";
import { Prisma } from "@prisma/client";
import { CreateEquipamentoLogsDTO } from "../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO";
export class EquipamentoLogService {
  private equipamentoLogRepository = new EquipamentoLogRepository();
  private equipamentoMetricaRepository = new EquipamentoMetricaRepository();

  async createManyEquipamentoLogs(
    data: CreateEquipamentoLogsDTO
  ): Promise<any> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const equipamentoId = data.logs[0].id_equipamento;

      if (!equipamentoId) return { success: false, message: 'Equipamento ID não fornecido' };
      const equipamentoMetricas =
        await this.equipamentoMetricaRepository.findByEquipamentoId(
          equipamentoId,
          tx
        );
      const metricaToEquipamentoMetrica = new Map<number, EquipamentoMetrica>();
      const newGroup = await this.equipamentoLogRepository.createGroup(equipamentoId ,tx);

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
      newGroup.logs = JSON.stringify(data.logs);
      console.log({newGroup});
     const updatedGroup = await this.equipamentoLogRepository.updateGroup(newGroup.id, newGroup, tx);
     console.log({updatedGroup});

      // Retornar o grupo criado com os logs
      return updatedGroup;
    });
  }

  private getSituation(groupedLogs: any[]): 'working' | 'frozen' {
    if (!Array.isArray(groupedLogs) || groupedLogs.length < 5) return 'working';
    const lastFiveLogs = groupedLogs.slice(0, 5);
    // Criar cópias sanitizadas sem timestamp e id, mantendo apenas os valores das métricas
    const sanitizedLogs = lastFiveLogs.map((log) => {
      const { timestamp, id, ...rest } = log;
      // Remover campos de alerta também para comparação
      const sanitized: any = {};
      Object.keys(rest).forEach(key => {
        if (!key.endsWith('_alert')) {
          sanitized[key] = rest[key];
        }
      });
      return sanitized;
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
    // Parse logs from JSON column and build rows
    const rows = groupedLogs.map((group: any) => {
      const row: any = {
        id: group.id,
        timestamp: group.timestamp
      };

      // Parse the logs JSON column
      let parsedLogs: any[] = [];
      if (group.logs) {
        try {
          // If logs is already an object (Prisma JSON type), use it directly
          // Otherwise, parse it as a string
          parsedLogs = typeof group.logs === 'string'
            ? JSON.parse(group.logs)
            : group.logs;
        } catch (error) {
          console.error('Error parsing logs JSON:', error);
          parsedLogs = [];
        }
      }
      // Build row with metric values and alerts
      parsedLogs.forEach((log: any) => {
        const valorConvertido = log.valor_convertido !== null && log.valor_convertido !== undefined
          ? Number(log.valor_convertido)
          : null;

        row[`metrica_${log.id_metrica}`] = valorConvertido;

        // Check value limits for alerts
        if (valorConvertido !== null) {
          const alert = this.checkValueLimits(valorConvertido, log.id_metrica, metrics);
          row[`metrica_${log.id_metrica}_alert`] = alert;
        }
      });

      return row;
    });

    
    return { 
      columns: columnsArray,
      rows,
      situation: this.getSituation(rows),
      metrics 
    };
  }
}
