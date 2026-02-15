import { Request, Response } from 'express';
import { SystemAnnouncementService } from '../services/systemAnnouncementService';
import { logError, logWarn } from '../utils/logger';

export class SystemAnnouncementController {
  private systemAnnouncementService = new SystemAnnouncementService();

  async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenantId;
      const filters = req.query ? req.query as any : {
        columnFilters: {
          id: '',
          title: '',
          type: '',
          is_active: '',
        },
        generalFilter: '',
      };

      if (!tenantId) {
        logWarn('Get announcements failed: missing tenant ID', { path: req.path });
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const announcements = await this.systemAnnouncementService.getAnnouncements(tenantId, filters);
      res.json(announcements);
    } catch (error) {
      logError('Failed to get announcements', error);
      res.status(500).json({ message: 'Erro ao buscar anúncios' });
    }
  }

  async getActiveAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const announcement = await this.systemAnnouncementService.getActiveAnnouncement(tenantId);
      res.json(announcement);
    } catch (error) {
      logError('Failed to get active announcement', error);
      res.status(500).json({ message: 'Erro ao buscar anúncio ativo' });
    }
  }

  async getAnnouncementById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const announcement = await this.systemAnnouncementService.getAnnouncementById(Number(id), tenantId);
      if (!announcement) {
        res.status(404).json({ message: 'Anúncio não encontrado' });
        return;
      }
      res.json(announcement);
    } catch (error) {
      logError('Failed to get announcement by ID', error, { announcementId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar anúncio' });
    }
  }

  async createAnnouncement(req: Request, res: Response): Promise<void> {
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

      const { title, description, type, is_active, starts_at } = req.body;

      if (!title || title.trim() === '') {
        res.status(400).json({ message: 'Título é obrigatório' });
        return;
      }

      if (!description || description.trim() === '') {
        res.status(400).json({ message: 'Descrição é obrigatória' });
        return;
      }

      if (!type) {
        res.status(400).json({ message: 'Tipo é obrigatório' });
        return;
      }

      const validTypes = ['CONTINGENCY', 'MAINTENANCE', 'INFO', 'CRITICAL'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ message: 'Tipo inválido. Tipos válidos: CONTINGENCY, MAINTENANCE, INFO, CRITICAL' });
        return;
      }

      const announcement = await this.systemAnnouncementService.createAnnouncement(
        {
          title,
          description,
          type,
          is_active: is_active !== undefined ? is_active : true,
          starts_at: starts_at ? new Date(starts_at) : new Date(),
        },
        tenantId,
        userId
      );

      if (!announcement) {
        res.status(500).json({ message: 'Erro ao criar anúncio' });
        return;
      }

      res.status(201).json(announcement);
    } catch (error) {
      logError('Failed to create announcement', error);
      res.status(500).json({ message: 'Erro ao criar anúncio' });
    }
  }

  async updateAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      const announcement = await this.systemAnnouncementService.updateAnnouncement(
        Number(id),
        req.body,
        tenantId
      );
      res.json(announcement);
    } catch (error) {
      logError('Failed to update announcement', error, { announcementId: req.params.id });
      res.status(500).json({ message: 'Erro ao atualizar anúncio' });
    }
  }

  async deleteAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(400).json({ message: 'Tenant ID is required' });
        return;
      }

      await this.systemAnnouncementService.deleteAnnouncement(Number(id), tenantId);
      res.status(204).send();
    } catch (error) {
      logError('Failed to delete announcement', error, { announcementId: req.params.id });
      res.status(500).json({ message: 'Erro ao deletar anúncio' });
    }
  }
}
