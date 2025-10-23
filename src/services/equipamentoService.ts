import { EquipmentFilters } from '../controllers/equipamentoController';
import { EquipamentoRepository } from '../repositories/equipamentoRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Equipamento } from '../types/Equipamento';
import { Usuario } from '../types/Usuario';

export class EquipamentoService {
  private equipamentoRepository = new EquipamentoRepository();
  private usuarioRepository = new UsuarioRepository();

  async getEquipamentos(userId: number, filters: EquipmentFilters): Promise<Equipamento[] | void[]> {
    console.log('EquipamentoService.getEquipamentos - userId:', userId);
    console.log('EquipamentoService.getEquipamentos - filters:', filters);
    
    const profileList = await this.usuarioRepository.findProfileList(userId);
    console.log('EquipamentoService.getEquipamentos - profiles:', profileList);
    
    const isResponsable = profileList.some(profile => profile.perfil?.nome === 'Responsável');
    console.log('EquipamentoService.getEquipamentos - isResponsable:', isResponsable);
    
    if(isResponsable) {
      const result = await this.equipamentoRepository.findByResponsableUser(userId, filters);
      console.log('EquipamentoService.getEquipamentos - findByResponsableUser result:', result);
      return result;
    }
    const result = await this.equipamentoRepository.findAll(filters);
    console.log('EquipamentoService.getEquipamentos - findAll result:', result);
    return result;
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
