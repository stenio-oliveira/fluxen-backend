import { UsuarioPerfilRepository } from '../repositories/usuarioPerfilRepository';
import { UsuarioPerfil } from '../types/UsuarioPerfil';

export class UsuarioPerfilService {
  private usuarioPerfilRepository = new UsuarioPerfilRepository();

  async getUsuarioPerfis(): Promise<UsuarioPerfil[]> {
    return this.usuarioPerfilRepository.findAll();
  }

  async getUsuarioPerfilById(id: number): Promise<UsuarioPerfil | null> {
    return this.usuarioPerfilRepository.findById(id);
  }

  async createUsuarioPerfil(data: UsuarioPerfil): Promise<UsuarioPerfil> {
    return this.usuarioPerfilRepository.create(data);
  }

  async updateUsuarioPerfil(id: number, data: Partial<UsuarioPerfil>): Promise<UsuarioPerfil> {
    return this.usuarioPerfilRepository.update(id, data);
  }

  async deleteUsuarioPerfil(id: number): Promise<void> {
    await this.usuarioPerfilRepository.delete(id);
  }
}
