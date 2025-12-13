import { NotificacaoRepository } from '../repositories/notificacaoRepository';
import { Notificacao } from '../types/Notificacao';
import { EquipamentoLogRepository } from '../repositories/equipamentoLogRepository';
import { EquipamentoMetricaRepository } from '../repositories/equipamentoMetricaRepository';
import { Cliente } from '../types/Cliente';
import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from '../utils/logger';

const prisma = new PrismaClient();

export class NotificacaoService {
  private notificacaoRepository = new NotificacaoRepository();
  private equipamentoLogRepository = new EquipamentoLogRepository();
  private equipamentoMetricaRepository = new EquipamentoMetricaRepository();

  /**
   * Cria notificações para alarmes detectados em um log específico
   * Chamado durante o processamento de logs recebidos dos equipamentos
   */
  async createNotificationsForLog(
    equipamentoId: number,
    log: { id_metrica: number; valor_convertido: number },
    equipamentoMetrica: any,
    timestamp: Date
  ): Promise<void> {
    try {
      // Buscar equipamento com cliente
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: equipamentoId },
        include: {
          cliente: true
        }
      });

      if (!equipamento || !equipamento.cliente) {
        return; // Equipamento não encontrado ou sem cliente
      }

      const cliente = equipamento.cliente;
      const valorConvertido = log.valor_convertido;
      const equipamentoMetricaData = equipamentoMetrica;

      // Verificar alarmes
      let tipoAlerta: 'min' | 'max' | null = null;

      if (equipamentoMetricaData.alarme_minimo !== null && equipamentoMetricaData.alarme_minimo !== undefined) {
        if (valorConvertido <= equipamentoMetricaData.alarme_minimo) {
          tipoAlerta = 'min';
        }
      }

      if (equipamentoMetricaData.alarme_maximo !== null && equipamentoMetricaData.alarme_maximo !== undefined) {
        if (valorConvertido >= equipamentoMetricaData.alarme_maximo) {
          tipoAlerta = 'max';
        }
      }

      if (!tipoAlerta) {
        return; // Nenhum alarme detectado
      }

      // Buscar métrica para nome e unidade (se não estiver aninhada, buscar separadamente)
      let metrica = equipamentoMetricaData.metrica;
      if (!metrica && equipamentoMetricaData.id_metrica) {
        metrica = await prisma.metrica.findUnique({
          where: { id: equipamentoMetricaData.id_metrica }
        });
      }
      const descricao = `Alerta ${tipoAlerta === 'min' ? 'MÍNIMO' : 'MÁXIMO'}: Equipamento "${equipamento.nome}" - Métrica "${metrica?.nome || 'Desconhecida'}" com valor ${valorConvertido.toFixed(2)} ${metrica?.unidade || ''} (${timestamp.toLocaleString('pt-BR')})`;

      // Criar notificações para responsável e administrador
      const notificacoesParaCriar: Array<{ id_usuario: number; descricao: string }> = [];

      if (cliente.id_responsavel) {
        notificacoesParaCriar.push({
          id_usuario: cliente.id_responsavel,
          descricao
        });
      }

      if (cliente.id_administrador && cliente.id_administrador !== cliente.id_responsavel) {
        notificacoesParaCriar.push({
          id_usuario: cliente.id_administrador,
          descricao
        });
      }

      if (notificacoesParaCriar.length > 0) {
        await this.notificacaoRepository.createMany(notificacoesParaCriar);
        logInfo(`[Notifications] Created ${notificacoesParaCriar.length} notification(s) for ${tipoAlerta.toUpperCase()} alarm - Equipment: ${equipamento.nome}, Metric: ${metrica?.nome}, Value: ${valorConvertido.toFixed(2)}`);
      }
    } catch (error) {
      logError(`[Notifications] Failed to create notifications for log`, error);
      // Não lançar erro para não interromper o processamento de logs
    }
  }

  async processNotificationsForUser(userId: number): Promise<void> {
    logInfo(`[Scan] Starting notification scan for user ${userId}`);

    // Buscar todos os clientes onde o usuário é responsável ou administrador (usando Prisma diretamente para evitar dependência circular)
    const clientesResponsavel = await prisma.cliente.findMany({
      where: {
        id_responsavel: userId
      }
    });

    const clientesAdministrador = await prisma.cliente.findMany({
      where: {
        id_administrador: userId
      }
    });

    const todosClientes = [...clientesResponsavel, ...clientesAdministrador];
    const clientesIds = [...new Set(todosClientes.map(c => c.id))];

    if (clientesIds.length === 0) {
      logInfo(`[Scan] User ${userId} has no associated clients - skipping`);
      return;
    }

    logInfo(`[Scan] Found ${clientesIds.length} client(s) for user ${userId}`);

    // Buscar todos os equipamentos desses clientes
    const equipamentos = await prisma.equipamento.findMany({
      where: {
        id_cliente: {
          in: clientesIds
        }
      }
    });

    if (equipamentos.length === 0) {
      logInfo(`[Scan] No equipment found for user ${userId} clients - skipping`);
      return;
    }

    const equipamentosIds = equipamentos.map(e => e.id);
    logInfo(`[Scan] Found ${equipamentos.length} equipment(s) to scan`);

    // Buscar logs grupos recentes (últimas 24 horas) desses equipamentos
    const umDiaAtras = new Date();
    umDiaAtras.setHours(umDiaAtras.getHours() - 24);

    const logsGrupos = await prisma.equipamento_log_grupo.findMany({
      where: {
        id_equipamento: {
          in: equipamentosIds
        },
        timestamp: {
          gte: umDiaAtras
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limitar para não sobrecarregar
    });

    // Processar cada log grupo e verificar alarmes
    const notificacoesParaCriar: Array<{ id_usuario: number; descricao: string }> = [];
    let totalLogsProcessed = 0;
    let totalAlarmsDetected = 0;

    logInfo(`[Scan] Processing ${logsGrupos.length} log group(s) from last 24h`);

    for (const logGrupo of logsGrupos) {
      if (!logGrupo.id_equipamento) continue;

      const equipamento = equipamentos.find(e => e.id === logGrupo.id_equipamento);
      if (!equipamento) continue;

      // Buscar métricas do equipamento
      const metrics = await this.equipamentoMetricaRepository.findByEquipamentoId(logGrupo.id_equipamento);

      // Parse dos logs
      let parsedLogs: any[] = [];
      if (logGrupo.logs) {
        try {
          parsedLogs = typeof logGrupo.logs === 'string'
            ? JSON.parse(logGrupo.logs)
            : logGrupo.logs;
        } catch (error) {
          continue;
        }
      }

      // Verificar cada log por alarmes
      for (const log of parsedLogs) {
        totalLogsProcessed++;
        const valorConvertido = log.valor_convertido !== null && log.valor_convertido !== undefined
          ? Number(log.valor_convertido)
          : null;

        if (valorConvertido === null) continue;

        const equipamentoMetrica = metrics.find(m => m.id_metrica === log.id_metrica);
        if (!equipamentoMetrica) continue;

        let tipoAlerta: 'min' | 'max' | null = null;

        // Verificar alarme mínimo
        if (equipamentoMetrica.alarme_minimo !== null && equipamentoMetrica.alarme_minimo !== undefined) {
          if (valorConvertido <= equipamentoMetrica.alarme_minimo) {
            tipoAlerta = 'min';
          }
        }

        // Verificar alarme máximo
        if (equipamentoMetrica.alarme_maximo !== null && equipamentoMetrica.alarme_maximo !== undefined) {
          if (valorConvertido >= equipamentoMetrica.alarme_maximo) {
            tipoAlerta = 'max';
          }
        }

        if (tipoAlerta) {
          totalAlarmsDetected++;
          const metrica = equipamentoMetrica.metrica;
          const descricao = `Alerta ${tipoAlerta === 'min' ? 'MÍNIMO' : 'MÁXIMO'}: Equipamento "${equipamento.nome}" - Métrica "${metrica?.nome || 'Desconhecida'}" com valor ${valorConvertido.toFixed(2)} ${metrica?.unidade || ''} (${new Date(logGrupo.timestamp || new Date()).toLocaleString('pt-BR')})`;

          // Criar notificação para responsável e administrador do cliente
          const cliente = todosClientes.find(c => c && c.id === equipamento.id_cliente);
          if (cliente) {
            // Adicionar notificação para responsável se existir
            if (cliente.id_responsavel) {
              notificacoesParaCriar.push({
                id_usuario: cliente.id_responsavel,
                descricao
              });
            }
            // Adicionar notificação para administrador se existir e for diferente do responsável
            if (cliente.id_administrador && cliente.id_administrador !== cliente.id_responsavel) {
              notificacoesParaCriar.push({
                id_usuario: cliente.id_administrador,
                descricao
              });
            }
          }
        }
      }
    }

    // Criar notificações em lote
    if (notificacoesParaCriar.length > 0) {
      const created = await this.notificacaoRepository.createMany(notificacoesParaCriar);
      logInfo(`[Scan] Created ${created} notification(s) from ${totalAlarmsDetected} alarm(s) detected`);
    } else {
      logInfo(`[Scan] No alarms detected - no notifications created`);
    }

    logInfo(`[Scan] Completed for user ${userId} - Processed: ${totalLogsProcessed} logs, Detected: ${totalAlarmsDetected} alarms, Created: ${notificacoesParaCriar.length} notifications`);
  }

  async getNotificationsByUser(userId: number, viewed?: boolean): Promise<Notificacao[]> {
    return this.notificacaoRepository.findByUser(userId, viewed);
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return this.notificacaoRepository.countByUser(userId, false);
  }

  async markAsRead(id: number): Promise<Notificacao> {
    return this.notificacaoRepository.markAsRead(id);
  }

  async markAllAsRead(userId: number): Promise<number> {
    return this.notificacaoRepository.markAllAsRead(userId);
  }
}

