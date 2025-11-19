import { Request, Response } from 'express';
import { ClienteService } from '../services/clienteService';
import { ClienteFilters } from '../repositories/clienteRepository';
import { logError, logWarn } from '../utils/logger';

export class ClienteController {
  private clienteService = new ClienteService();

  async getClientes(req: Request, res: Response): Promise<void> {
    const filters: ClienteFilters = req.query ? req.query as any : {};
    const userId = req.query['userId'] || req.user?.id;

    if (!userId) {
      logWarn('Get clients failed: missing user ID', { path: req.path });
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    try {
      const clientes = await this.clienteService.getClientes(Number(userId), filters);
      res.json(clientes);
    } catch (error) {
      logError('Failed to get clients', error, { userId });
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
      logError('Failed to get client by ID', error, { clienteId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar cliente' });
    }
  }

  async createCliente(req: Request, res: Response): Promise<void> {
    try {
      const cliente = await this.clienteService.createCliente(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      logError('Failed to create client', error);
      res.status(500).json({ message: 'Erro ao criar cliente' });
    }
  }

  async updateCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cliente = await this.clienteService.updateCliente(Number(id), req.body);
      res.json(cliente);
    } catch (error) {
      logError('Failed to update client', error, { clienteId: req.params.id });
      res.status(500).json({ message: 'Erro ao atualizar cliente' });
    }
  }

  async deleteCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.clienteService.deleteCliente(Number(id));
      res.status(204).send();
    } catch (error) {
      logError('Failed to delete client', error, { clienteId: req.params.id });
      res.status(500).json({ message: 'Erro ao deletar cliente' });
    }
  }
}

