import { Request, Response } from 'express';
import { MetricaService } from '../services/metricaService';
import { logError } from '../utils/logger';


export interface MetricasFilters{ 
  generalFilter: string,
  columnFilters: {
    id: string | null;
    nome: string | null;
    unidade: string | null;
  }
}
export class MetricaController {
  private metricaService = new MetricaService();

  async getMetricas(req: Request, res: Response): Promise<void> {
    const filters : MetricasFilters = req.query ? req.query as any: {};
    try {

      const metricas = await this.metricaService.getMetricas(filters);
      res.json(metricas);
    } catch (error) {
      logError('Failed to get metrics', error);
      res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
  }

  async getMetricaByEquipamentoId(req: Request, res: Response): Promise<void> {
    try {
      const { id_equipamento } = req.params;
      const metricas = await this.metricaService.getMetricaByEquipamentoId(
        Number(id_equipamento)
      );
      res.json(metricas);
    } catch (error) {
      logError('Failed to get metrics by equipment ID', error, { equipamentoId: req.params.id_equipamento });
      res.status(500).json({ message: 'Erro ao buscar métricas de equipamento' });
    }
  }

  async associateMetricToEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const { id_equipamento, id_metrica } = req.params;
      const {valor_minimo, valor_maximo} = req.body;
      const metrica = await this.metricaService.associateMetricToEquipamento(
        Number(id_metrica),
        Number(id_equipamento),
        Number(valor_minimo),
        Number(valor_maximo)
      );
      res.json(metrica);
    } catch (error) {
      logError('Failed to associate metric to equipment', error, { id_equipamento, id_metrica });
      res.status(500).json({ message: 'Erro ao associar métrica ao equipamento' });
    }
  }

  async desassociateMetricToEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const { id_equipamento, id_metrica } = req.params;
      const associatedMetrics = await this.metricaService.desassociateMetricToEquipamento(
        Number(id_metrica),
        Number(id_equipamento)
      );
      res.json(associatedMetrics);
    } catch (error) {
      logError('Failed to desassociate metric from equipment', error, { id_equipamento, id_metrica });
      res.status(500).json({ message: 'Erro ao desassociar métrica ao equipamento' });
    }
  }

  async getMetricaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metrica = await this.metricaService.getMetricaById(Number(id));
      if (!metrica) {
        res.status(404).json({ message: 'Métrica não encontrada' });
        return;
      }
      res.json(metrica);
    } catch (error) {
      logError('Failed to get metric by ID', error, { metricaId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar métrica' });
    }
  }

  async createMetrica(req: Request, res: Response): Promise<void> {
    try {
      const metrica = await this.metricaService.createMetrica(req.body);
      res.status(201).json(metrica);
    } catch (error) {
      logError('Failed to create metric', error);
      res.status(500).json({ message: 'Erro ao criar métrica' });
    }
  }

  async updateMetrica(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metrica = await this.metricaService.updateMetrica(Number(id), req.body);
      res.json(metrica);
    } catch (error) {
      logError('Failed to update metric', error, { metricaId: id });
      res.status(500).json({ message: 'Erro ao atualizar métrica' });
    }
  }

  async deleteMetrica(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.metricaService.deleteMetrica(Number(id));
      res.status(204).send();
    } catch (error) {
      logError('Failed to delete metric', error, { metricaId: id });
      res.status(500).json({ message: 'Erro ao deletar métrica' });
    }
  }

  async getMetricasStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.metricaService.getMetricasStats();
      res.json(stats);
    } catch (error) {
      logError('Failed to get metrics statistics', error);
      res.status(500).json({ message: 'Erro ao buscar estatísticas das métricas' });
    }
  }
}
