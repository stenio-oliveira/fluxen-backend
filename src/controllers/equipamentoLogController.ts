import { Request, Response } from 'express';
import { EquipamentoLogService } from '../services/equipamentoLogService';
import { CreateEquipamentoLogsDTO } from '../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO';
import { logError, logWarn, logInfo } from '../utils/logger';

export class EquipamentoLogController {
  private equipamentoLogService = new EquipamentoLogService();

  async receiveLogsFromEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateEquipamentoLogsDTO;
      const equipamentoId = req.equipamento?.id;

      if (data && data.logs && Array.isArray(data.logs)) {
        const seenMetricas = new Set<number>();
        for (const log of data.logs) {
          if (seenMetricas.has(log.id_metrica)) {
            logWarn('Duplicate metric ID in log batch', {
              equipamentoId,
              metricId: log.id_metrica
            });
            res.status(400).json({ message: "Não pode haver mais de um valor com o mesmo id_metrica" });
            return;
          }
          seenMetricas.add(log.id_metrica);
        }
      }

      const group = await this.equipamentoLogService.createManyEquipamentoLogs(req.body);
      logInfo('Equipment logs received successfully', {
        equipamentoId,
        groupId: group.id,
        logsCount: data.logs?.length || 0
      });
      res.status(201).json(group);
    } catch (error) {
      logError('Failed to receive equipment logs', error, {
        equipamentoId: req.equipamento?.id
      });
      res.status(500).json({ message: 'Erro ao receber logs de equipamento' });
    }
  }


  async getLogsTableData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tableData = await this.equipamentoLogService.getLogsTableData(Number(id));
      res.json(tableData);
    } catch (error) {
      logError('Failed to get logs table data', error, { equipamentoId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar dados da tabela de logs' });
    }
  }
}
