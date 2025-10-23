import { UsuarioPerfilRepository } from '../repositories/usuarioPerfilRepository';
import { Perfil } from '../types/Perfil';
import { UsuarioPerfil } from '../types/UsuarioPerfil';

export class UsuarioPerfilService {
  private usuarioPerfilRepository = new UsuarioPerfilRepository();

  async getUsuarioPerfis(): Promise<Perfil[]> {
    return this.usuarioPerfilRepository.findAll();
  }

  async getUsuarioPerfilById(id: number): Promise<Perfil | null> {
    return this.usuarioPerfilRepository.findById(id);
  }

  async createUsuarioPerfil(data: Partial<Perfil>): Promise<Perfil> {
    return this.usuarioPerfilRepository.create(data);
  }

  async updateUsuarioPerfil(id: number, data: Partial<Perfil>): Promise<Perfil> {
    return this.usuarioPerfilRepository.update(id, data);
  }

  async deleteUsuarioPerfil(id: number): Promise<void> {
    await this.usuarioPerfilRepository.delete(id);
  }
}
