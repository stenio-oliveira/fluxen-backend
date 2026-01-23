import { UsuarioPerfilClienteRepository } from '../repositories/usuarioPerfilClienteRepository';
import { prisma } from '../database';
import { Prisma } from '@prisma/client';

export interface UpdateUsuarioPerfilClienteDTO {
  id_usuario: number;
  relacionamentos: {
    id_cliente: number;
    id_perfil: number; // 2 = responsável, 3 = gestor
  }[];
}

export interface UpdateClienteRelacionamentosDTO {
  id_cliente: number;
  relacionamentos: {
    id_usuario: number;
    id_perfil: number; // 2 = responsável, 3 = gestor
  }[];
}

export class UsuarioPerfilClienteService {
  private repository = new UsuarioPerfilClienteRepository();

  async getRelacionamentosByUsuario(id_usuario: number) {
    return this.repository.findByUsuarioId(id_usuario);
  }

  async updateRelacionamentos(data: UpdateUsuarioPerfilClienteDTO, tenantId: number) {
    const { id_usuario, relacionamentos } = data;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deletar todos os relacionamentos existentes do usuário (exceto admin)
      // Primeiro, verificar se o usuário é admin
      const isAdmin = await tx.usuario_perfil.findFirst({
        where: {
          id_usuario,
          id_perfil: 1,
          id_tenant: tenantId,
        },
      });

      // Se não for admin, deletar todos os relacionamentos usuario_perfil_cliente do tenant
      if (!isAdmin) {
        await tx.usuario_perfil_cliente.deleteMany({
          where: { 
            id_usuario,
            id_tenant: tenantId,
          },
        });
      }

      // Criar novos relacionamentos
      for (const relacionamento of relacionamentos) {
        const { id_cliente, id_perfil } = relacionamento;

        // Verificar se já existe
        const existing = await tx.usuario_perfil_cliente.findFirst({
          where: {
            id_usuario,
            id_cliente,
            id_perfil,
            id_tenant: tenantId,
          },
        });

        if (!existing) {
          await tx.usuario_perfil_cliente.create({
            data: {
              id_usuario,
              id_cliente,
              id_perfil,
              id_tenant: tenantId,
            },
          });
        }
      }

      // Retornar os relacionamentos atualizados
      return this.repository.findByUsuarioId(id_usuario);
    });
  }

  async getRelacionamentosByCliente(id_cliente: number) {
    return this.repository.findByClienteId(id_cliente);
  }

  async updateRelacionamentosByCliente(data: UpdateClienteRelacionamentosDTO, tenantId: number) {
    const { id_cliente, relacionamentos } = data;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deletar todos os relacionamentos existentes do cliente do tenant
      await tx.usuario_perfil_cliente.deleteMany({
        where: { 
          id_cliente,
          id_tenant: tenantId,
        },
      });

      // Criar novos relacionamentos
      for (const relacionamento of relacionamentos) {
        const { id_usuario, id_perfil } = relacionamento;
        await tx.usuario_perfil_cliente.create({
          data: {
            id_usuario,
            id_cliente,
            id_perfil,
            id_tenant: tenantId,
          },
        });
      }

      // Retornar os relacionamentos atualizados
      return this.repository.findByClienteId(id_cliente);
    });
  }
}

