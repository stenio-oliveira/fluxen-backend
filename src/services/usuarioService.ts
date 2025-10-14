import { ClientesFilters } from '../controllers/usuarioController';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Usuario } from '../types/Usuario';

export class UsuarioService {
  private usuarioRepository = new UsuarioRepository();

  async getUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.findAll();
  }


  
  async getClientUsers(filters?: ClientesFilters): Promise<Usuario[]> {
    return this.usuarioRepository.findClientUsers(filters);
  }

  async getClienteByEquipamentoId(id_equipamento: number): Promise<Usuario | null> {
    return this.usuarioRepository.findByEquipamentoId(id_equipamento);
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findById(id);
  }

  async createUsuario(data: Usuario): Promise<Usuario> {
    return this.usuarioRepository.create(data);
  }

  async createClient(data: Usuario): Promise<Usuario> {
    return this.usuarioRepository.createClient(data);
  }

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario> {
    return this.usuarioRepository.update(id, data);
  }

  async deleteUsuario(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}
