import { PerfilRepository } from '../repositories/perfilRepository';
import { Perfil } from '../types/Perfil';

export class PerfilService {
  private perfilRepository = new PerfilRepository();

  async getPerfis(): Promise<Perfil[]> {
    return this.perfilRepository.findAll();
  }

  async getPerfilById(id: number): Promise<Perfil | null> {
    return this.perfilRepository.findById(id);
  }

  async createPerfil(data: Perfil): Promise<Perfil> {
    return this.perfilRepository.create(data);
  }

  async updatePerfil(id: number, data: Partial<Perfil>): Promise<Perfil> {
    return this.perfilRepository.update(id, data);
  }

  async deletePerfil(id: number): Promise<void> {
    await this.perfilRepository.delete(id);
  }
}
