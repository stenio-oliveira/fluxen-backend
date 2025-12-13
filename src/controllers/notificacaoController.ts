import { Request, Response } from 'express';
import { NotificacaoService } from '../services/notificacaoService';
import { logError } from '../utils/logger';

export class NotificacaoController {
  private notificacaoService = new NotificacaoService();

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const viewed = req.query.viewed === 'true' ? true : req.query.viewed === 'false' ? false : undefined;
      const notifications = await this.notificacaoService.getNotificationsByUser(userId, viewed);
      res.json(notifications);
    } catch (error) {
      logError('Failed to get notifications', error);
      res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const count = await this.notificacaoService.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      logError('Failed to get notification count', error);
      res.status(500).json({ message: 'Erro ao buscar contagem de notificações' });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const notification = await this.notificacaoService.markAsRead(Number(id));
      res.json(notification);
    } catch (error) {
      logError('Failed to mark notification as viewed', error);
      res.status(500).json({ message: 'Erro ao marcar notificação como visualizada' });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const count = await this.notificacaoService.markAllAsRead(userId);
      res.json({ count, message: `${count} notificação(ões) marcada(s) como visualizada(s)` });
    } catch (error) {
      logError('Failed to mark all notifications as viewed', error);
      res.status(500).json({ message: 'Erro ao marcar notificações como visualizadas' });
    }
  }
}


