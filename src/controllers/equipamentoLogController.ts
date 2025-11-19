import { Request, Response } from 'express';
import { EquipamentoLogService } from '../services/equipamentoLogService';
import { CreateEquipamentoLogsDTO } from '../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO';
import { logError, logWarn, logInfo } from '../utils/logger';

export class EquipamentoLogController {
  private equipamentoLogService = new EquipamentoLogService();

  async getEquipamentoLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.equipamentoLogService.getEquipamentoLogs();
      res.json(logs);
    } catch (error) {
      logError('Failed to get equipment logs', error);
      res.status(500).json({ message: 'Erro ao buscar logs de equipamentos' });
    }
  }

  async getEquipamentoLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await this.equipamentoLogService.getEquipamentoLogById(Number(id));
      if (!log) {
        res.status(404).json({ message: 'Log de equipamento não encontrado' });
        return;
      }
      res.json(log);
    } catch (error) {
      logError('Failed to get equipment log by ID', error, { logId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar log de equipamento' });
    }
  }

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

      const logs = await this.equipamentoLogService.createManyEquipamentoLogs(req.body);
      logInfo('Equipment logs received successfully', {
        equipamentoId,
        logsCount: logs.length
      });
      res.status(201).json(logs);
    } catch (error) {
      logError('Failed to receive equipment logs', error, {
        equipamentoId: req.equipamento?.id
      });
      res.status(500).json({ message: 'Erro ao receber logs de equipamento' });
    }
  }

  async createManyEquipamentoLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.equipamentoLogService.createManyEquipamentoLogs(req.body);
      res.status(201).json(logs);
    } catch (error) {
      logError('Failed to create equipment logs', error);
      res.status(500).json({ message: 'Erro ao criar logs de equipamentos' });
    }
  }

  async createEquipamentoLog(req: Request, res: Response): Promise<void> {
    try {
      const log = await this.equipamentoLogService.createEquipamentoLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      logError('Failed to create equipment log', error);
      res.status(500).json({ message: 'Erro ao criar log de equipamento' });
    }
  }

  async updateEquipamentoLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await this.equipamentoLogService.updateEquipamentoLog(Number(id), req.body);
      res.json(log);
    } catch (error) {
      logError('Failed to update equipment log', error, { logId: id });
      res.status(500).json({ message: 'Erro ao atualizar log de equipamento' });
    }
  }

  async deleteEquipamentoLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.equipamentoLogService.deleteEquipamentoLog(Number(id));
      res.status(204).send();
    } catch (error) {
      logError('Failed to delete equipment log', error, { logId: id });
      res.status(500).json({ message: 'Erro ao deletar log de equipamento' });
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
