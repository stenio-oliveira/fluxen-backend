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
export class UsuarioController {
  private usuarioService = new UsuarioService();

  async getUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.usuarioService.getUsuarios();
      res.json(usuarios);
    } catch (error) {
      console.error("Erro em getUsuarios:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  }

  async getClientes(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await this.usuarioService.getClientUsers();
      res.json(clientes);
    } catch (error) {
      console.error("Erro em getClientes:", error);
      res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  }

  async getClientUsers (req: Request, res: Response): Promise<void> {
    try {
      const filters : ClientesFilters = req.query ? req.query as any: {};
      console.log("getClientUsers - filters", filters);
      const clientUsers = await this.usuarioService.getClientUsers(filters);
      res.json(clientUsers);
    } catch (error) {
      console.error("Erro em getClientUsers:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  };
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

  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const usuario = await this.usuarioService.createClient(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      console.error("Erro em createClient:", error);
      res.status(500).json({ message: "Erro ao criar cliente" });
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
