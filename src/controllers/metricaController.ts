import { Request, Response } from 'express';
import { MetricaService } from '../services/metricaService';


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
      console.error('Erro em getMetricas:', error);
      res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
  }

  async getMetricaByEquipamentoId(req: Request, res: Response): Promise<void> {
    try {
      const { id_equipamento } = req.params;
      const metricas = await this.metricaService.getMetricaByEquipamentoId(
        Number(id_equipamento)
      );
      console.log("metircas associadas ao equipamento", metricas);
      res.json(metricas);
    } catch (error) {
      console.error('Erro em getMetricaByEquipamentoId:', error);
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
      console.error('Erro em associateMetricToEquipamento:', error);
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
      console.error('Erro em desassociateMetricToEquipamento:', error);
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
      console.error('Erro em getMetricaById:', error);
      res.status(500).json({ message: 'Erro ao buscar métrica' });
    }
  }

  async createMetrica(req: Request, res: Response): Promise<void> {
    try {
      const metrica = await this.metricaService.createMetrica(req.body);
      res.status(201).json(metrica);
    } catch (error) {
      console.error('Erro em createMetrica:', error);
      res.status(500).json({ message: 'Erro ao criar métrica' });
    }
  }

  async updateMetrica(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metrica = await this.metricaService.updateMetrica(Number(id), req.body);
      res.json(metrica);
    } catch (error) {
      console.error('Erro em updateMetrica:', error);
      res.status(500).json({ message: 'Erro ao atualizar métrica' });
    }
  }

  async deleteMetrica(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.metricaService.deleteMetrica(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro em deleteMetrica:', error);
      res.status(500).json({ message: 'Erro ao deletar métrica' });
    }
  }

  async getMetricasStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.metricaService.getMetricasStats();
      res.json(stats);
    } catch (error) {
      console.error('Erro em getMetricasStats:', error);
      res.status(500).json({ message: 'Erro ao buscar estatísticas das métricas' });
    }
  }
}
