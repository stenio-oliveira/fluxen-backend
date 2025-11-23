import { EquipmentFilters } from '../controllers/equipamentoController';
import { EquipamentoRepository } from '../repositories/equipamentoRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Equipamento } from '../types/Equipamento';
import { Usuario } from '../types/Usuario';

export class EquipamentoService {
  private equipamentoRepository = new EquipamentoRepository();
  private usuarioRepository = new UsuarioRepository();

  async getEquipamentos(userId: number, filters: EquipmentFilters): Promise<Equipamento[] | void[]> {
    const isAdmin = await this.usuarioRepository.isAdmin(userId);
    const isResponsable = await this.usuarioRepository.isResponsable(userId);

    if(isAdmin) {
      return await this.equipamentoRepository.findByAdministratorUser(userId, filters);
    }
    if(isResponsable) {
      return await this.equipamentoRepository.findByResponsableUser(userId, filters);
    }
    return [];
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
