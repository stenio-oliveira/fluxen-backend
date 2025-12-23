import { EquipamentoLogRepository, PaginationOptions } from "../repositories/equipamentoLogRepository";
import { EquipamentoMetricaRepository } from "../repositories/equipamentoMetricaRepository";
import { EquipamentoMetrica } from "../types/EquipamentoMetrica";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateEquipamentoLogsDTO } from "../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO";
import { rabbitMQService } from "./rabbitmqService";
import { logError, logInfo } from "../utils/logger";
import { NotificacaoService } from "./notificacaoService";

const prisma = new PrismaClient();

export class EquipamentoLogService {
  private equipamentoLogRepository: EquipamentoLogRepository;
  private equipamentoMetricaRepository: EquipamentoMetricaRepository;
  private notificacaoService: NotificacaoService;

  constructor() {
    this.equipamentoLogRepository = new EquipamentoLogRepository();
    this.equipamentoMetricaRepository = new EquipamentoMetricaRepository();
    this.notificacaoService = new NotificacaoService();
  }

  async sendLogsToRabbitMQ(data: CreateEquipamentoLogsDTO): Promise<boolean> {
    try {
      // Verificar se RabbitMQ está conectado
      if (!rabbitMQService.isConnected()) {
        logError('RabbitMQ not connected, attempting to connect...', new Error('RabbitMQ not connected'));
        await rabbitMQService.connect();
      }

      // Publicar logs na fila
      const published = await rabbitMQService.publishLogs(data);

      if (published) {
        logInfo('Logs sent to RabbitMQ successfully', {
          equipamentoId: data.logs?.[0]?.id_equipamento,
          logsCount: data.logs?.length || 0
        });
        return true;
      } else {
        logError('Failed to publish logs to RabbitMQ - queue buffer full', new Error('Queue buffer full'));
        return false;
      }
    } catch (error) {
      logError('Failed to send logs to RabbitMQ', error, {
        equipamentoId: data.logs?.[0]?.id_equipamento
      });
      throw error;
    }
  }

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
      const timestamp = new Date();
      for (const log of data.logs) {
        const equipamentoMetrica = metricaToEquipamentoMetrica.get(
          log.id_metrica || 0
        );
        if (equipamentoMetrica) {
          const range_original_min = 0;
          const range_original_max = 4095;
          const { valor } = log;
          const { valor_minimo, valor_maximo } = equipamentoMetrica;
          // Verificar se valor_convertido já foi fornecido
          if (log.valor_convertido === undefined || log.valor_convertido === null) {
          // Se valor_convertido não foi fornecido, calcular usando regra de 3
            const calculatedValue =
              ((Number(valor) - range_original_min) * (valor_maximo - valor_minimo)) /
              (range_original_max - range_original_min) +
              valor_minimo;
            // Arredondar para 2 casas decimais
            log.valor_convertido = Math.round(calculatedValue * 100) / 100;
          } else {
            // Se já foi fornecido, garantir que está arredondado para 2 casas decimais
            log.valor_convertido = Math.round(Number(log.valor_convertido) * 100) / 100;
          }

          log.id_equipamento_metrica = equipamentoMetrica.id;

          // Se não foi fornecido timestamp, usar o atual
          if (!log.timestamp) {
            log.timestamp = timestamp;
          }

          // Criar notificações se houver alarme (fora da transação para não bloquear)
          if (log.valor_convertido !== null && log.valor_convertido !== undefined) {
            // Processar notificações de forma assíncrona após a transação
            const valorConvertido = log.valor_convertido;
            const idMetrica = log.id_metrica || 0;
            const logTimestamp = log.timestamp || timestamp;
            setImmediate(() => {
              this.notificacaoService.createNotificationsForLog(
                equipamentoId,
                { id_metrica: idMetrica, valor_convertido: valorConvertido },
                equipamentoMetrica,
                logTimestamp
              ).catch(error => {
                logError('Failed to create notifications for log', error);
              });
            });
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
    // metrics é um array de EquipamentoMetrica[] (já vem do findByEquipamentoId)
    // Cada item já contém: id, id_equipamento, id_metrica, valor_minimo, valor_maximo, alarme_minimo, alarme_maximo, metrica
    const equipamentoMetrica = metrics.find(m => m.id_metrica === metricId);

    if (!equipamentoMetrica || !equipamentoMetrica.valor_maximo) {
      return 'none';
    }

    // Se alarme_minimo está configurado, verificar se o valor está abaixo
    if (equipamentoMetrica.alarme_minimo !== null && equipamentoMetrica.alarme_minimo !== undefined) {
      if (value <= equipamentoMetrica.alarme_minimo) {
        return 'min';
      }
    }

    // Se alarme_maximo está configurado, verificar se o valor está acima
    if (equipamentoMetrica.alarme_maximo !== null && equipamentoMetrica.alarme_maximo !== undefined) {
      if (value >= equipamentoMetrica.alarme_maximo) {
       
        return 'max';
      }
    }

    // Se não há alarmes configurados, retornar 'none' (sem alarme)
    return 'none';
  }

  private buildRowsFromGroups(groups: any[], metrics: any[]): any[] {
    return groups.map((group: any) => {
      const row: any = {
        id: group.id,
        timestamp: group.timestamp
      };

      let parsedLogs: any[] = [];
      if (group.logs) {
        try {
          parsedLogs = typeof group.logs === 'string'
            ? JSON.parse(group.logs)
            : group.logs;
        } catch (error) {
          console.error('Error parsing logs JSON:', error);
          parsedLogs = [];
        }
      }

      parsedLogs.forEach((log: any) => {
        const valorConvertido = log.valor_convertido !== null && log.valor_convertido !== undefined
          ? Math.round(Number(log.valor_convertido) * 100) / 100
          : null;

        row[`metrica_${log.id_metrica}`] = valorConvertido;

        if (valorConvertido !== null) {
          const alert = this.checkValueLimits(valorConvertido, log.id_metrica, metrics);
          row[`metrica_${log.id_metrica}_alert`] = alert;
        }
      });

      return row;
    });
  }

  async getLogsTableData(
    id_equipamento: number,
    paginationOptions: PaginationOptions = {},
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const metrics = await this.equipamentoMetricaRepository.findByEquipamentoId(id_equipamento);

    let groups: any[];
    let total: number;

    // Se datas forem fornecidas, usar findByDateRange (sem paginação)
    if (startDate && endDate) {
      groups = await this.equipamentoLogRepository.findByDateRange(
        id_equipamento,
        startDate,
        endDate
      );
      total = groups.length;
    } else {
    // Caso contrário, usar paginação normal
      const page = Math.max(paginationOptions.page ?? 1, 1);
      const pageSize = Math.max(Math.min(paginationOptions.pageSize ?? 50, 500), 1);
      const result = await this.equipamentoLogRepository.findGroupedByTimestamp(
        id_equipamento,
        { page, pageSize }
      );
      groups = result.groups;
      total = result.total;
    }

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
    const rows = this.buildRowsFromGroups(groups, metrics);

    let situationRows = rows;
    // Só buscar situation rows se não estiver usando filtro de data e não estiver na primeira página
    if (!startDate && !endDate) {
      const page = Math.max(paginationOptions.page ?? 1, 1);
      if (page !== 1) {
        const { groups: recentGroups } = await this.equipamentoLogRepository.findGroupedByTimestamp(
          id_equipamento,
          { page: 1, pageSize: 5 }
        );
        situationRows = this.buildRowsFromGroups(recentGroups, metrics);
      }
    }

    logInfo('Logs table data', {
      rowsLength: rows.length,
      hasDateFilter: !!(startDate && endDate),
    })

    const page = Math.max(paginationOptions.page ?? 1, 1);
    const pageSize = Math.max(Math.min(paginationOptions.pageSize ?? 50, 500), 1);

    return { 
      columns: columnsArray,
      rows,
      situation: this.getSituation(situationRows),
      metrics,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages: total > 0 ? Math.ceil(total / pageSize) : 0
      }
    };
  }
}
