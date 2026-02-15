import { Request, Response } from 'express';
import { SupportTicketService } from '../services/supportTicketService';
import { logError, logWarn } from '../utils/logger';

export class SupportTicketController {
  private supportTicketService = new SupportTicketService();

  async getTicketsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id ? Number(req.user.id) : undefined;
      const tenantId = req.tenantId;

      if (!userId) {
        logWarn('Get support tickets failed: missing user ID', { path: req.path });
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      if (!tenantId) {
        logWarn('Get support tickets failed: missing tenant ID', { path: req.path });
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const tickets = await this.supportTicketService.getTicketsByUser(userId, tenantId);
      res.json(tickets);
    } catch (error) {
      logError('Failed to get support tickets', error, { userId: req.user?.id });
      res.status(500).json({ message: 'Erro ao buscar tickets de suporte' });
    }
  }

  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const ticket = await this.supportTicketService.getTicketById(Number(id), tenantId);
      if (!ticket) {
        res.status(404).json({ message: 'Ticket não encontrado' });
        return;
      }
      res.json(ticket);
    } catch (error) {
      logError('Failed to get support ticket by ID', error, { ticketId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar ticket de suporte' });
    }
  }

  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenantId;
      const userId = req.user?.id ? Number(req.user.id) : undefined;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const { descricao, email, numero_telefone, anexo } = req.body;

      if (!descricao || descricao.trim() === '') {
        res.status(400).json({ message: 'Descrição é obrigatória' });
        return;
      }

      const ticket = await this.supportTicketService.createTicket(
        {
          descricao,
          email,
          numero_telefone,
          anexo,
        },
        tenantId,
        userId
      );

      if (!ticket) {
        res.status(500).json({ message: 'Erro ao criar ticket de suporte' });
        return;
      }

      res.status(201).json(ticket);
    } catch (error) {
      logError('Failed to create support ticket', error);
      res.status(500).json({ message: 'Erro ao criar ticket de suporte' });
    }
  }

  async updateTicket(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const ticket = await this.supportTicketService.updateTicket(
        Number(id),
        req.body,
        tenantId
      );
      res.json(ticket);
    } catch (error) {
      logError('Failed to update support ticket', error, { ticketId: req.params.id });
      res.status(500).json({ message: 'Erro ao atualizar ticket de suporte' });
    }
  }
}
