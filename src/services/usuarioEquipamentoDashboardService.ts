import { UsuarioEquipamentoDashboardRepository } from '../repositories/usuarioEquipamentoDashboardRepository';
import { UsuarioEquipamentoDashboard } from '../types/UsuarioEquipamentoDashboard';
import { EquipamentoRepository } from '../repositories/equipamentoRepository';
import { hasEquipamentoPermission } from '../utils/equipamentoPermissionHelper';

export class UsuarioEquipamentoDashboardService {
  private repository = new UsuarioEquipamentoDashboardRepository();
  private equipamentoRepository = new EquipamentoRepository();

  /**
   * Busca todos os equipamentos do dashboard do usuário
   */
  async getEquipamentosDashboard(userId: number): Promise<UsuarioEquipamentoDashboard[]> {
    return this.repository.findByUsuarioId(userId);
  }

  /**
   * Adiciona um equipamento ao dashboard do usuário
   * Verifica se o usuário tem permissão para ver o equipamento
   * Como os equipamentos já são filtrados por perfil x cliente, se o equipamento
   * aparece para o usuário, ele pode adicioná-lo ao seu dashboard
   */
  async addEquipamentoToDashboard(
    userId: number,
    equipamentoId: number,
    tenantId: number,
    id_metrica?: number | null,
    id_tipo_grafico?: number | null
  ): Promise<UsuarioEquipamentoDashboard> {
    // Verifica se o equipamento existe
    const equipamento = await this.equipamentoRepository.findById(equipamentoId, tenantId);
    if (!equipamento) {
      throw new Error('Equipamento não encontrado');
    }

    if (!equipamento.id_cliente) {
      throw new Error('Equipamento não está associado a um cliente');
    }
    // Verificar se o usuário tem permissão básica para acessar o equipamento
    const hasPermission = await hasEquipamentoPermission(userId, equipamentoId);

    if (!hasPermission) {
      throw new Error('Usuário não tem permissão para adicionar este equipamento ao dashboard');
    }
    // Verifica se já está no dashboard com a mesma métrica
    const exists = await this.repository.exists(userId, equipamentoId, id_metrica);
    if (exists) {
      throw new Error('Esta combinação de equipamento e métrica já está no dashboard');
    }

    return this.repository.create(userId, equipamentoId, tenantId, id_metrica, id_tipo_grafico);
  }

  /**
   * Remove um equipamento do dashboard do usuário (por ID da associação)
   */
  async removeEquipamentoFromDashboardById(
    id: number
  ): Promise<void> {
    await this.repository.deleteById(id);
  }

  /**
   * Remove um equipamento do dashboard do usuário (com métrica específica)
   */
  async removeEquipamentoFromDashboard(
    userId: number,
    equipamentoId: number,
    id_metrica?: number | null
  ): Promise<void> {
    // Verifica se existe a associação
    const exists = await this.repository.exists(userId, equipamentoId, id_metrica);
    if (!exists) {
      throw new Error('Equipamento não está no dashboard');
    }

    await this.repository.delete(userId, equipamentoId, id_metrica);
  }

  /**
   * Verifica se um equipamento está no dashboard do usuário
   */
  async isEquipamentoInDashboard(
    userId: number,
    equipamentoId: number,
    id_metrica?: number | null
  ): Promise<boolean> {
    return this.repository.exists(userId, equipamentoId, id_metrica);
  }

  /**
   * Atualiza o tipo de gráfico de uma associação existente
   */
  async updateTipoGrafico(
    id: number,
    id_tipo_grafico: number | null
  ): Promise<UsuarioEquipamentoDashboard> {
    return this.repository.updateTipoGrafico(id, id_tipo_grafico);
  }
}


