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
          if (log.valor_convertido !== undefined && log.valor_convertido !== null) {
            // Se valor_convertido está preenchido, usar ele diretamente
            // O valor bruto permanece como está
            console.log(`Log ${log.id_metrica}: Usando valor_convertido fornecido: ${log.valor_convertido}`);
          } else {
          // Se valor_convertido não foi fornecido, calcular usando regra de 3
            log.valor_convertido =
              ((Number(valor) - range_original_min) * (valor_maximo - valor_minimo)) /
              (range_original_max - range_original_min) +
              valor_minimo;
            console.log(`Log ${log.id_metrica}: Calculando valor_convertido: ${log.valor_convertido} (valor bruto: ${valor})`);
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

  async getLogsTableData(id_equipamento: number): Promise<any> {
    const columns  = await this.equipamentoMetricaRepository.findByEquipamentoId(id_equipamento);
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
    columns.forEach((column) => {
      if (column.metrica?.nome) {
        columnsArray.push({
          field: `metrica_${column.id_metrica}`,
          headerName: `${column.metrica.nome} (${column.metrica.unidade})`,
          flex: 1,
          disableColumnMenu: true,
          type: 'number'
        });
      }
    });
    
    return { 
      columns: columnsArray,
      rows: groupedLogs
    };
  }
}
