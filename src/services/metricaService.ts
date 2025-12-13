import { MetricasFilters } from '../controllers/metricaController';
import { MetricaRepository } from '../repositories/metricaRepository';
import { Metrica } from '../types/Metrica';

export class MetricaService {
  private metricaRepository = new MetricaRepository();

  async getMetricas(filters: MetricasFilters): Promise<Metrica[]> {

    return await this.metricaRepository.findAll(filters);
  }

  async getMetricaById(id: number): Promise<Metrica | null> {
    return this.metricaRepository.findById(id);
  }

  async associateMetricToEquipamento(
    id_metrica: number,
    id_equipamento: number,
    valor_minimo: number,
    valor_maximo: number,
    alarme_minimo: number | null = null,
    alarme_maximo: number | null = null
  ): Promise<Metrica | null> {
    return this.metricaRepository.associateMetricToEquipamento(
      id_metrica,
      id_equipamento,
      valor_minimo,
      valor_maximo,
      alarme_minimo,
      alarme_maximo
    );
  }

  async desassociateMetricToEquipamento(id_metrica: number, id_equipamento: number): Promise<Metrica[] | null> {
    return this.metricaRepository.desassociateMetricToEquipamento(id_metrica, id_equipamento);
  }

  async getMetricaByEquipamentoId(id_equipamento: number): Promise<Metrica[]> {
    return this.metricaRepository.findByEquipamentoId(id_equipamento);
  }

  async createMetrica(data: Metrica): Promise<Metrica> {
    return this.metricaRepository.create(data);
  }

  async updateMetrica(id: number, data: Partial<Metrica>): Promise<Metrica> {
    return this.metricaRepository.update(id, data);
  }

  async deleteMetrica(id: number): Promise<void> {
    await this.metricaRepository.delete(id);
  }

  async getMetricasStats(): Promise<{
    totalMetricas: number;
    metricasAtivas: number;
    unidadesUnicas: number;
  }> {
    return this.metricaRepository.getMetricasStats();
  }
}
