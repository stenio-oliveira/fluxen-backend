import { Router } from 'express';
import { SystemAnnouncementController } from '../controllers/systemAnnouncementController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const systemAnnouncementController = new SystemAnnouncementController();

// Rota pública para buscar anúncio ativo (usada pelo frontend para todos os usuários)
router.get(
  '/system-announcements/active',
  authenticateToken,
  validateTenant,
  systemAnnouncementController.getActiveAnnouncement.bind(systemAnnouncementController)
);

// Rotas protegidas para ADM
router.get(
  '/system-announcements',
  authenticateToken,
  validateTenant,
  systemAnnouncementController.getAnnouncements.bind(systemAnnouncementController)
);

router.get(
  '/system-announcements/:id',
  authenticateToken,
  validateTenant,
  systemAnnouncementController.getAnnouncementById.bind(systemAnnouncementController)
);

router.post(
  '/system-announcements',
  authenticateToken,
  validateTenant,
  systemAnnouncementController.createAnnouncement.bind(systemAnnouncementController)
);

router.put(
  '/system-announcements/:id',
  authenticateToken,
  validateTenant,
  systemAnnouncementController.updateAnnouncement.bind(systemAnnouncementController)
);

router.delete(
  '/system-announcements/:id',
  authenticateToken,
  validateTenant,
  systemAnnouncementController.deleteAnnouncement.bind(systemAnnouncementController)
);

export default router;
