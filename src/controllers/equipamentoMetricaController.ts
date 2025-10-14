import { Request, Response } from 'express';
import { EquipamentoMetricaService } from '../services/equipamentoMetricaService';

export class EquipamentoMetricaController {
  private equipamentoMetricaService = new EquipamentoMetricaService();

  async getEquipamentoMetricas(req: Request, res: Response): Promise<void> {
    try {
      const metricas = await this.equipamentoMetricaService.getEquipamentoMetricas();
      res.json(metricas);
    } catch (error) {
      console.error('Erro em getEquipamentoMetricas:', error);
      res.status(500).json({ message: 'Erro ao buscar métricas de equipamentos' });
    }
  }

  async getEquipamentoMetricaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metrica = await this.equipamentoMetricaService.getEquipamentoMetricaById(Number(id));
      if (!metrica) {
        res.status(404).json({ message: 'Métrica de equipamento não encontrada' });
        return;
      }
      res.json(metrica);
    } catch (error) {
      console.error('Erro em getEquipamentoMetricaById:', error);
      res.status(500).json({ message: 'Erro ao buscar métrica de equipamento' });
    }
  }

  async createEquipamentoMetrica(req: Request, res: Response): Promise<void> {
    try {
      const metrica = await this.equipamentoMetricaService.createEquipamentoMetrica(req.body);
      res.status(201).json(metrica);
    } catch (error) {
      console.error('Erro em createEquipamentoMetrica:', error);
      res.status(500).json({ message: 'Erro ao criar métrica de equipamento' });
    }
  }

  async updateEquipamentoMetrica(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metrica = await this.equipamentoMetricaService.updateEquipamentoMetrica(Number(id), req.body);
      res.json(metrica);
    } catch (error) {
      console.error('Erro em updateEquipamentoMetrica:', error);
      res.status(500).json({ message: 'Erro ao atualizar métrica de equipamento' });
    }
  }

  async deleteEquipamentoMetrica(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.equipamentoMetricaService.deleteEquipamentoMetrica(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro em deleteEquipamentoMetrica:', error);
      res.status(500).json({ message: 'Erro ao deletar métrica de equipamento' });
    }
  }
}
