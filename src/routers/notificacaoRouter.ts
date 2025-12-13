import { Router } from 'express';
import { NotificacaoController } from '../controllers/notificacaoController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const controller = new NotificacaoController();

// Get user notifications
router.get(
  '/notificacoes',
  authenticateToken,
  controller.getNotifications.bind(controller)
);

// Get unread notifications count
router.get(
  '/notificacoes/count',
  authenticateToken,
  controller.getUnreadCount.bind(controller)
);

// Mark notification as read
router.put(
  '/notificacoes/:id/visualizar',
  authenticateToken,
  controller.markAsRead.bind(controller)
);

// Mark all notifications as read
router.put(
  '/notificacoes/visualizar-todas',
  authenticateToken,
  controller.markAllAsRead.bind(controller)
);

export default router;


