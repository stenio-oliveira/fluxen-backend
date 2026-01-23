import { Prisma } from '@prisma/client';
import { ClienteFilters } from '../repositories/clienteRepository';
import { ClienteRepository } from '../repositories/clienteRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Cliente, CreateClientDTO } from '../types/Cliente';
import { prisma } from '../database';

export class ClienteService {
  private clienteRepository = new ClienteRepository();
  private usuarioRepository = new UsuarioRepository()

  async getClientes(userId: number, filters: ClienteFilters, tenantId: number): Promise<Cliente[] | void[]> {
    const isAdmin = await this.usuarioRepository.isAdmin(userId);
    const isResponsable = await this.usuarioRepository.isResponsable(userId);
    const isManager = await this.usuarioRepository.isManager(userId);

    if (isAdmin) {
      return this.clienteRepository.findAll(filters, tenantId);
    }

    if (isManager) {
      return this.clienteRepository.findByManagerUser(userId, filters, tenantId);
    }

    if (isResponsable) {
      return this.clienteRepository.findByResponsableUser(userId, filters, tenantId);
    }
    return [];
  }

  async getClientesByManager(userId: number, tenantId: number, filters?: ClienteFilters): Promise<Cliente[] | void[]> {
    const defaultFilters: ClienteFilters = filters || {
      columnFilters: {
        id: "",
        nome: "",
        cnpj: "",
      },
      generalFilter: "",
    };
    return this.clienteRepository.findByManagerUser(userId, defaultFilters, tenantId);
  }

  async getClienteById(id: number, tenantId: number): Promise<Cliente | null> {
    return this.clienteRepository.findById(id, tenantId);
  }

  async createCliente(data: Partial<CreateClientDTO>, tenantId: number): Promise<Cliente | null> {
    const { nome, cnpj, relacionamentos = [] } = data;
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newClient = await this.clienteRepository.create({ nome, cnpj }, tenantId, tx);
      if (!newClient) {
        throw new Error('Erro ao criar cliente');
      }

      // Criar relacionamentos usuario_perfil_cliente
      for (const relacionamento of relacionamentos) {
        const { id_usuario, id_perfil } = relacionamento;
        await tx.usuario_perfil_cliente.create({
          data: {
            id_usuario,
            id_perfil,
            id_cliente: newClient.id,
            id_tenant: tenantId,
          },
        });
      }

      return newClient;
    });
  }

  async updateCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
    return this.clienteRepository.update(id, data);
  }

  async deleteCliente(id: number): Promise<void> {
    await this.clienteRepository.delete(id);
  }
}

