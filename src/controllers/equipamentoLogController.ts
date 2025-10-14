import { Request, Response } from 'express';
import { EquipamentoLogService } from '../services/equipamentoLogService';
import { CreateEquipamentoLogsDTO } from '../dto/HttpRequestDTOS/CreateEquipamentoLogsDTO';

export class EquipamentoLogController {
  private equipamentoLogService = new EquipamentoLogService();

  async getEquipamentoLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.equipamentoLogService.getEquipamentoLogs();
      res.json(logs);
    } catch (error) {
      console.error('Erro em getEquipamentoLogs:', error);
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
      console.error('Erro em getEquipamentoLogById:', error);
      res.status(500).json({ message: 'Erro ao buscar log de equipamento' });
    }
  }

  async receiveLogsFromEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateEquipamentoLogsDTO;
      const logs = await this.equipamentoLogService.createManyEquipamentoLogs(req.body);
      res.status(201).json(logs);
    } catch (error) {
      console.error('Erro em receiveLogsFromEquipamento:', error);
      res.status(500).json({ message: 'Erro ao receber logs de equipamento' });
    }
  }

  async createManyEquipamentoLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.equipamentoLogService.createManyEquipamentoLogs(req.body);
      res.status(201).json(logs);
    } catch (error) {
      console.error('Erro em createManyEquipamentoLogs:', error);
      res.status(500).json({ message: 'Erro ao criar logs de equipamentos' });
    }
  }
  

  async createEquipamentoLog(req: Request, res: Response): Promise<void> {
    try {
      const log = await this.equipamentoLogService.createEquipamentoLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      console.error('Erro em createEquipamentoLog:', error);
      res.status(500).json({ message: 'Erro ao criar log de equipamento' });
    }
  }

  async updateEquipamentoLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await this.equipamentoLogService.updateEquipamentoLog(Number(id), req.body);
      res.json(log);
    } catch (error) {
      console.error('Erro em updateEquipamentoLog:', error);
      res.status(500).json({ message: 'Erro ao atualizar log de equipamento' });
    }
  }

  async deleteEquipamentoLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.equipamentoLogService.deleteEquipamentoLog(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro em deleteEquipamentoLog:', error);
      res.status(500).json({ message: 'Erro ao deletar log de equipamento' });
    }
  }
}
