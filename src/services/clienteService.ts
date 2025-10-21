import { ClienteFilters } from '../repositories/clienteRepository';
import { ClienteRepository } from '../repositories/clienteRepository';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Cliente } from '../types/Cliente';

export class ClienteService {
  private clienteRepository = new ClienteRepository();
  private usuarioRepository = new UsuarioRepository();

  async getClientes(userId: number, filters: ClienteFilters): Promise<Cliente[] | void[]> {
    const profileList = await this.usuarioRepository.findProfileList(userId);
    const isResponsable = profileList.some(profile => profile.perfil?.nome === 'Responsável');
    
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
    return this.clienteRepository.create(data);
  }

  async updateCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
    return this.clienteRepository.update(id, data);
  }

  async deleteCliente(id: number): Promise<void> {
    await this.clienteRepository.delete(id);
  }
}

