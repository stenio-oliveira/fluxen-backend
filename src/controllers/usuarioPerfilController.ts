import { Request, Response } from 'express';
import { UsuarioPerfilService } from '../services/usuarioPerfilService';
import { logError } from '../utils/logger';

export class UsuarioPerfilController {
  private usuarioPerfilService = new UsuarioPerfilService();

  async getUsuarioPerfis(req: Request, res: Response): Promise<void> {
    try {
      const usuarioPerfis = await this.usuarioPerfilService.getUsuarioPerfis();
      res.json(usuarioPerfis);
    } catch (error) {
      logError('Failed to get user profiles', error);
      res.status(500).json({ message: 'Erro ao buscar perfis de usuários' });
    }
  }

  async getUsuarioPerfilById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioPerfil = await this.usuarioPerfilService.getUsuarioPerfilById(Number(id));
      if (!usuarioPerfil) {
        res.status(404).json({ message: 'Perfil de usuário não encontrado' });
        return;
      }
      res.json(usuarioPerfil);
    } catch (error) {
      logError('Failed to get user profile by ID', error, { perfilId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar perfil de usuário' });
    }
  }

  async createUsuarioPerfil(req: Request, res: Response): Promise<void> {
    try {
      const usuarioPerfil = await this.usuarioPerfilService.createUsuarioPerfil(req.body);
      res.status(201).json(usuarioPerfil);
    } catch (error) {
      logError('Failed to create user profile', error);
      res.status(500).json({ message: 'Erro ao criar perfil de usuário' });
    }
  }

  async updateUsuarioPerfil(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioPerfil = await this.usuarioPerfilService.updateUsuarioPerfil(Number(id), req.body);
      res.json(usuarioPerfil);
    } catch (error) {
      logError('Failed to update user profile', error, { perfilId: id });
      res.status(500).json({ message: 'Erro ao atualizar perfil de usuário' });
    }
  }

  async deleteUsuarioPerfil(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.usuarioPerfilService.deleteUsuarioPerfil(Number(id));
      res.status(204).send();
    } catch (error) {
      logError('Failed to delete user profile', error, { perfilId: id });
      res.status(500).json({ message: 'Erro ao deletar perfil de usuário' });
    }
  }
}
