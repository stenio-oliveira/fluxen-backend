import { EquipmentFilters } from '../controllers/equipamentoController';
import { EquipamentoRepository } from '../repositories/equipamentoRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Equipamento } from '../types/Equipamento';
import { Usuario } from '../types/Usuario';
import { prisma } from '../database';

export class EquipamentoService {
  private equipamentoRepository = new EquipamentoRepository();
  private usuarioRepository = new UsuarioRepository();

  async getEquipamentos(userId: number, filters: EquipmentFilters): Promise<Equipamento[] | void[]> {
    const isAdmin = await this.usuarioRepository.isAdmin(userId);
    const isResponsable = await this.usuarioRepository.isResponsable(userId);
    const isManager = await this.usuarioRepository.isManager(userId);
    console.log("isAdmin", isAdmin);
    console.log("isResponsable", isResponsable);
    console.log("isManager", isManager);
    if(isAdmin) {
      return await this.equipamentoRepository.findAll(filters);
    }
    if (isManager) {
      return await this.equipamentoRepository.findByManagerUser(userId, filters);
    }
    if(isResponsable) {
      return await this.equipamentoRepository.findByResponsableUser(userId, filters);
    }
    return [];
  }

  async getEquipamentoById(id: number): Promise<Equipamento | null> {
    return this.equipamentoRepository.findById(id);
  }

  async createEquipamento(data: Partial<Equipamento>, userId?: number): Promise<Equipamento | null> {
    // Se userId foi fornecido, verificar permissões
    if (userId !== undefined) {
      const isAdmin = await this.usuarioRepository.isAdmin(userId);

      // Se não for admin, verificar se é gestor do cliente
      if (!isAdmin) {
        if (!data.id_cliente) {
          throw new Error('Cliente é obrigatório para criar equipamento');
        }

        // Verificar se o usuário é gestor do cliente
        const isManagerOfClient = await prisma.usuario_perfil_cliente.findFirst({
          where: {
            id_usuario: userId,
            id_cliente: data.id_cliente,
            id_perfil: 3 // gestor
          }
        });

        if (!isManagerOfClient) {
          throw new Error('Usuário não tem permissão para criar equipamentos neste cliente');
        }
      }
    }

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
