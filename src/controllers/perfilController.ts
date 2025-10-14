import { Request, Response } from 'express';
import { PerfilService } from '../services/perfilService';

export class PerfilController {
  private perfilService = new PerfilService();

  async getPerfis(req: Request, res: Response): Promise<void> {
    try {
      const perfis = await this.perfilService.getPerfis();
      res.json(perfis);
    } catch (error) {
      console.error('Erro em getPerfis:', error);
      res.status(500).json({ message: 'Erro ao buscar perfis' });
    }
  }

  async getPerfilById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const perfil = await this.perfilService.getPerfilById(Number(id));
      if (!perfil) {
        res.status(404).json({ message: 'Perfil não encontrado' });
        return;
      }
      res.json(perfil);
    } catch (error) {
      console.error('Erro em getPerfilById:', error);
      res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
  }

  async createPerfil(req: Request, res: Response): Promise<void> {
    try {
      const perfil = await this.perfilService.createPerfil(req.body);
      res.status(201).json(perfil);
    } catch (error) {
      console.error('Erro em createPerfil:', error);
      res.status(500).json({ message: 'Erro ao criar perfil' });
    }
  }

  async updatePerfil(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const perfil = await this.perfilService.updatePerfil(Number(id), req.body);
      res.json(perfil);
    } catch (error) {
      console.error('Erro em updatePerfil:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  }

  async deletePerfil(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.perfilService.deletePerfil(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro em deletePerfil:', error);
      res.status(500).json({ message: 'Erro ao deletar perfil' });
    }
  }
}
