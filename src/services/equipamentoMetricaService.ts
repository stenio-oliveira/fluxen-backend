import { EquipamentoMetricaRepository } from '../repositories/equipamentoMetricaRepository';
import { EquipamentoMetrica } from '../types/EquipamentoMetrica';
import { hasEquipamentoPermission } from '../utils/equipamentoPermissionHelper';

export class EquipamentoMetricaService {
  private equipamentoMetricaRepository = new EquipamentoMetricaRepository();

  async getEquipamentoMetricas(): Promise<EquipamentoMetrica[]> {
    return this.equipamentoMetricaRepository.findAll();
  }

  async getEquipamentoMetricaById(id: number): Promise<EquipamentoMetrica | null> {
    return this.equipamentoMetricaRepository.findById(id);
  }

  async createEquipamentoMetrica(data: EquipamentoMetrica, tenantId: number): Promise<EquipamentoMetrica> {
    return this.equipamentoMetricaRepository.create(data, tenantId);
  }

  async updateEquipamentoMetrica(id: number, data: Partial<EquipamentoMetrica>, userId?: number): Promise<EquipamentoMetrica> {
    // Buscar o equipamento_metrica para obter o id_equipamento
    const equipamentoMetrica = await this.equipamentoMetricaRepository.findById(id);
    if (!equipamentoMetrica) {
      throw new Error('Equipamento métrica não encontrado');
    }

    // Verificar permissão se userId foi fornecido
    if (userId) {
      const hasPermission = await hasEquipamentoPermission(userId, equipamentoMetrica.id_equipamento);
      if (!hasPermission) {
        throw new Error('Usuário não tem permissão para atualizar métricas deste equipamento');
      }
    }
    
    return this.equipamentoMetricaRepository.update(id, data);
  }

  async deleteEquipamentoMetrica(id: number, userId?: number): Promise<void> {
    // Buscar o equipamento_metrica para obter o id_equipamento
    const equipamentoMetrica = await this.equipamentoMetricaRepository.findById(id);
    if (!equipamentoMetrica) {
      throw new Error('Equipamento métrica não encontrado');
    }

    // Verificar permissão se userId foi fornecido
    if (userId) {
      const hasPermission = await hasEquipamentoPermission(userId, equipamentoMetrica.id_equipamento);
      if (!hasPermission) {
        throw new Error('Usuário não tem permissão para deletar métricas deste equipamento');
      }
    }

    await this.equipamentoMetricaRepository.delete(id);
  }
}
