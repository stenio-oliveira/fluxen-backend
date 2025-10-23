import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuarioService';


export interface ClientesFilters {
  columnFilters: {
    id: string | null;
    nome: string | null;
    email: string | null;
    username: string | null;
  };
  generalFilter: string;
}

export interface UserFilters {
  columnFilters: {
    id: string | null;
    nome: string | null;
    email: string | null;
    username: string | null;
  };
  generalFilter: string;
}
export class UsuarioController {
  private usuarioService = new UsuarioService();

  async getUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const filters: UserFilters = req.query ? req.query as any: {};
      const userId = req.query.userId as string; 
      const usuarios = await this.usuarioService.getUsuarios(Number(userId), filters);
      res.json(usuarios);
    } catch (error) {
      console.error("Erro em getUsuarios:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  }

  async getClienteByEquipamentoId(req: Request, res: Response): Promise<void> {
    try {
      const { id_equipamento } = req.params;
      const cliente = await this.usuarioService.getClienteByEquipamentoId(
        Number(id_equipamento)
      );
      res.json(cliente);
    } catch (error) {
      console.error("Erro em getClienteByEquipamentoId:", error);
      res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  }

  async getUsuarioById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = await this.usuarioService.getUsuarioById(Number(id));
      if (!usuario) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }
      res.json(usuario);
    } catch (error) {
      console.error("Erro em getUsuarioById:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  }

  async createUsuario(req: Request, res: Response): Promise<void> {
    try {
      const usuario = await this.usuarioService.createUsuario(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      console.error("Erro em createUsuario:", error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  }

  async updateUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = await this.usuarioService.updateUsuario(
        Number(id),
        req.body
      );
      res.json(usuario);
    } catch (error) {
      console.error("Erro em updateUsuario:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  }

  async deleteUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.usuarioService.deleteUsuario(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error("Erro em deleteUsuario:", error);
      res.status(500).json({ message: "Erro ao deletar usuário" });
    }
  }
}
