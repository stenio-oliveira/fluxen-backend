import { EquipmentFilters } from '../controllers/equipamentoController';
import { EquipamentoRepository } from '../repositories/equipamentoRepository';
import { Equipamento } from '../types/Equipamento';

export class EquipamentoService {
  private equipamentoRepository = new EquipamentoRepository();

  async getEquipamentos(filters: EquipmentFilters): Promise<Equipamento[] | void[]> {
    return this.equipamentoRepository.findAll(filters);
  }

  async getEquipamentoById(id: number): Promise<Equipamento | null> {
    return this.equipamentoRepository.findById(id);
  }

  async createEquipamento(data: Partial<Equipamento>): Promise<Equipamento | null> {
    return this.equipamentoRepository.create(data);
  }

  async updateEquipamento(id: number, data: Partial<Equipamento>): Promise<Equipamento> {
    return this.equipamentoRepository.update(id, data);
  }

  async deleteEquipamento(id: number): Promise<void> {
    await this.equipamentoRepository.delete(id);
  }

  async generateApiKey(equipamentoId: number): Promise<string> {
    const apiKey = `eq_${equipamentoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('apiKey: ', apiKey)
    console.log('equipamentoId: ', equipamentoId)
    await this.equipamentoRepository.update(equipamentoId, { api_key: apiKey });
    return apiKey;
  }

  async regenerateApiKey(equipamentoId: number): Promise<string> {
    // Primeiro remove a API key atual
    await this.equipamentoRepository.update(equipamentoId, { api_key: null });
    
    // Gera uma nova
    return this.generateApiKey(equipamentoId);
  }
}
