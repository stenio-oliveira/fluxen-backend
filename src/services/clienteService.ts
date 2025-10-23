import { Prisma } from '@prisma/client';
import { ClienteFilters } from '../repositories/clienteRepository';
import { ClienteRepository } from '../repositories/clienteRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Cliente } from '../types/Cliente';
import { prisma } from '..';

export class ClienteService {
  private clienteRepository = new ClienteRepository();
  private usuarioRepository = new UsuarioRepository();

  async getClientes(userId: number, filters: ClienteFilters): Promise<Cliente[] | void[]> {
    console.log('ClienteService.getClientes - userId:', userId);
    const profileList = await this.usuarioRepository.findProfileList(userId);
    const isResponsable = profileList.some(profile => profile.perfil?.nome === 'Responsável');

    console.log('isResponsable', isResponsable);

    if (isResponsable) {
      // Se for responsável, só pode ver clientes que ele é responsável
      return this.clienteRepository.findByResponsableUser(userId, filters);
    }
    
    // Se for admin ou outro perfil, pode ver todos os clientes
    return this.clienteRepository.findAll(filters);
  }

  async getClienteById(id: number): Promise<Cliente | null> {
    return this.clienteRepository.findById(id);
  }

  async createCliente(data: Partial<Cliente>): Promise<Cliente | null> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newCliente = await this.clienteRepository.create(data, tx);
      if (newCliente) {
        const userProfiles = await this.usuarioRepository.findProfileList(data.id_responsavel || 0, tx);
        if (userProfiles.some(profile => profile.perfil?.nome === 'Responsável')) {
          return newCliente;
        }
        //se usuario não é responsável, adiciona o perfil de responsável
        await tx.usuario_perfil.create({
          data: {
            id_usuario: data.id_responsavel || 0,
            id_perfil: 2, //responsável
          },
        });
      }
      return newCliente;
    });
  }

  async updateCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
    return this.clienteRepository.update(id, data);
  }

  async deleteCliente(id: number): Promise<void> {
    await this.clienteRepository.delete(id);
  }
}

