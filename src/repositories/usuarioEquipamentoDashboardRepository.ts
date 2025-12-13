import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { UsuarioEquipamentoDashboard } from '../types/UsuarioEquipamentoDashboard';
import { Equipamento } from '../types/Equipamento';

export class UsuarioEquipamentoDashboardRepository {
  
  include = (): Prisma.usuario_equipamento_dashboardInclude => {
    return {
      usuario: {
        include: {
          usuario_perfil: {
            include: {
              perfil: true
            }
          }
        }
      },
      equipamento: {
        include: {
          cliente: true,
          equipamento_metricas: {
            include: {
              metrica: true
            }
          }
        }
      }
    };
  };

  format = (item: any): UsuarioEquipamentoDashboard => {
    return {
      id: item.id,
      id_usuario: item.id_usuario,
      id_equipamento: item.id_equipamento,
      created_at: item.created_at,
      usuario: item.usuario,
      equipamento: item.equipamento as Equipamento
    };
  };

  /**
   * Busca todos os equipamentos associados ao dashboard de um usuário
   */
  async findByUsuarioId(
    id_usuario: number,
    tx?: Prisma.TransactionClient
  ): Promise<UsuarioEquipamentoDashboard[]> {
    const executor = tx || prisma;
    
    const items = await executor.usuario_equipamento_dashboard.findMany({
      where: {
        id_usuario
      },
      include: this.include(),
      orderBy: {
        created_at: 'desc'
      }
    });

    return items.map(item => this.format(item));
  }

  /**
   * Busca um equipamento específico do dashboard do usuário
   */
  async findByUsuarioAndEquipamento(
    id_usuario: number,
    id_equipamento: number,
    tx?: Prisma.TransactionClient
  ): Promise<UsuarioEquipamentoDashboard | null> {
    const executor = tx || prisma;
    
    const item = await executor.usuario_equipamento_dashboard.findFirst({
      where: {
        id_usuario,
        id_equipamento
      },
      include: this.include()
    });

    return item ? this.format(item) : null;
  }

  /**
   * Adiciona um equipamento ao dashboard do usuário
   */
  async create(
    id_usuario: number,
    id_equipamento: number,
    tx?: Prisma.TransactionClient
  ): Promise<UsuarioEquipamentoDashboard> {
    const executor = tx || prisma;
    
    const item = await executor.usuario_equipamento_dashboard.create({
      data: {
        id_usuario,
        id_equipamento,
        created_at: new Date()
      },
      include: this.include()
    });

    return this.format(item);
  }

  /**
   * Remove um equipamento do dashboard do usuário
   */
  async delete(
    id_usuario: number,
    id_equipamento: number,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const executor = tx || prisma;
    const unique = await executor.usuario_equipamento_dashboard.findFirst({
      where: {
        id_usuario,
        id_equipamento
      },
      select: {
        id: true
      }
    });
    await executor.usuario_equipamento_dashboard.delete({
      where: {
        id : unique?.id
      }
    });
  }

  /**
   * Remove todos os equipamentos do dashboard do usuário
   */
  async deleteAllByUsuario(
    id_usuario: number,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const executor = tx || prisma;
    
    await executor.usuario_equipamento_dashboard.deleteMany({
      where: {
        id_usuario
      }
    });
  }

  /**
   * Verifica se um equipamento já está no dashboard do usuário
   */
  async exists(
    id_usuario: number,
    id_equipamento: number,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const executor = tx || prisma;
    
    const count = await executor.usuario_equipamento_dashboard.count({
      where: {
        id_usuario,
        id_equipamento
      }
    });

    return count > 0;
  }
}


