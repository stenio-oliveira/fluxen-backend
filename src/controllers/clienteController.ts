import { Request, Response } from 'express';
import { ClienteService } from '../services/clienteService';
import { ClienteFilters } from '../repositories/clienteRepository';

export class ClienteController {
  private clienteService = new ClienteService();

  async getClientes(req: Request, res: Response): Promise<void> {
    console.log('=== CLIENTE CONTROLLER ===');
    console.log('ClienteController.getClientes - req query:', req.query);
    console.log('ClienteController.getClientes - req user:', req.user);
    console.log('ClienteController.getClientes - req headers:', req.headers);

    const filters: ClienteFilters = req.query ? req.query as any : {};
    const userId = req.query['userId'];
    console.log('ClienteController.getClientes - userId from query:', userId);

    // Se não há userId no query, tentar pegar do token decodificado
    const userIdFromToken = req.user?.id;
    console.log('ClienteController.getClientes - userId from token:', userIdFromToken);

    const finalUserId = userId || userIdFromToken;
    console.log('ClienteController.getClientes - final userId:', finalUserId);

    if (!finalUserId) {
      console.error('No userId provided');
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    try {
      const clientes = await this.clienteService.getClientes(Number(finalUserId), filters);
      console.log('ClienteController.getClientes - result:', clientes);
      res.json(clientes);
    } catch (error) {
      console.error('Erro em getClientes:', error);
      res.status(500).json({ message: 'Erro ao buscar clientes' });
    }
  }

  async getClienteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cliente = await this.clienteService.getClienteById(Number(id));
      if (!cliente) {
        res.status(404).json({ message: 'Cliente não encontrado' });
        return;
      }
      res.json(cliente);
    } catch (error) {
      console.error('Erro em getClienteById:', error);
      res.status(500).json({ message: 'Erro ao buscar cliente' });
    }
  }

  async createCliente(req: Request, res: Response): Promise<void> {
    try {
      const cliente = await this.clienteService.createCliente(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      console.error('Erro em createCliente:', error);
      res.status(500).json({ message: 'Erro ao criar cliente' });
    }
  }

  async updateCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cliente = await this.clienteService.updateCliente(Number(id), req.body);
      res.json(cliente);
    } catch (error) {
      console.error('Erro em updateCliente:', error);
      res.status(500).json({ message: 'Erro ao atualizar cliente' });
    }
  }

  async deleteCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.clienteService.deleteCliente(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro em deleteCliente:', error);
      res.status(500).json({ message: 'Erro ao deletar cliente' });
    }
  }
}

