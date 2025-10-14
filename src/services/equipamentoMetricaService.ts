import { EquipamentoMetricaRepository } from '../repositories/equipamentoMetricaRepository';
import { EquipamentoMetrica } from '../types/EquipamentoMetrica';

export class EquipamentoMetricaService {
  private equipamentoMetricaRepository = new EquipamentoMetricaRepository();

  async getEquipamentoMetricas(): Promise<EquipamentoMetrica[]> {
    return this.equipamentoMetricaRepository.findAll();
  }

  async getEquipamentoMetricaById(id: number): Promise<EquipamentoMetrica | null> {
    return this.equipamentoMetricaRepository.findById(id);
  }

  async createEquipamentoMetrica(data: EquipamentoMetrica): Promise<EquipamentoMetrica> {
    return this.equipamentoMetricaRepository.create(data);
  }

  async updateEquipamentoMetrica(id: number, data: Partial<EquipamentoMetrica>): Promise<EquipamentoMetrica> {
    
    return this.equipamentoMetricaRepository.update(id, data);
  }

  async deleteEquipamentoMetrica(id: number): Promise<void> {
    await this.equipamentoMetricaRepository.delete(id);
  }
}
