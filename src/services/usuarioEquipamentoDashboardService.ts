import { UsuarioEquipamentoDashboardRepository } from '../repositories/usuarioEquipamentoDashboardRepository';
import { UsuarioEquipamentoDashboard } from '../types/UsuarioEquipamentoDashboard';
import { EquipamentoRepository } from '../repositories/equipamentoRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';

export class UsuarioEquipamentoDashboardService {
  private repository = new UsuarioEquipamentoDashboardRepository();
  private equipamentoRepository = new EquipamentoRepository();
  private usuarioRepository = new UsuarioRepository();

  /**
   * Busca todos os equipamentos do dashboard do usuário
   */
  async getEquipamentosDashboard(userId: number): Promise<UsuarioEquipamentoDashboard[]> {
    return this.repository.findByUsuarioId(userId);
  }

  /**
   * Adiciona um equipamento ao dashboard do usuário
   * Verifica se o usuário tem permissão para ver o equipamento
   */
  async addEquipamentoToDashboard(
    userId: number,
    equipamentoId: number
  ): Promise<UsuarioEquipamentoDashboard> {
    // Verifica se o equipamento existe
    const equipamento = await this.equipamentoRepository.findById(equipamentoId);
    if (!equipamento) {
      throw new Error('Equipamento não encontrado');
    }

    // Verifica se o usuário tem permissão para ver este equipamento
    const isAdmin = await this.usuarioRepository.isAdmin(userId);
    const isResponsable = await this.usuarioRepository.isResponsable(userId);
    
    if (!isAdmin && !isResponsable) {
      throw new Error('Usuário não tem permissão para adicionar equipamentos ao dashboard');
    }

    // Verifica se já está no dashboard
    const exists = await this.repository.exists(userId, equipamentoId);
    if (exists) {
      throw new Error('Equipamento já está no dashboard');
    }

    return this.repository.create(userId, equipamentoId);
  }

  /**
   * Remove um equipamento do dashboard do usuário
   */
  async removeEquipamentoFromDashboard(
    userId: number,
    equipamentoId: number
  ): Promise<void> {
    // Verifica se existe a associação
    const exists = await this.repository.exists(userId, equipamentoId);
    if (!exists) {
      throw new Error('Equipamento não está no dashboard');
    }

    await this.repository.delete(userId, equipamentoId);
  }

  /**
   * Verifica se um equipamento está no dashboard do usuário
   */
  async isEquipamentoInDashboard(
    userId: number,
    equipamentoId: number
  ): Promise<boolean> {
    return this.repository.exists(userId, equipamentoId);
  }
}


