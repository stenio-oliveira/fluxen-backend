import { Router } from 'express';
import { UsuarioEquipamentoDashboardController } from '../controllers/usuarioEquipamentoDashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const controller = new UsuarioEquipamentoDashboardController();

// Todas as rotas requerem autenticação JWT
router.get(
  '/usuario-equipamento-dashboard/:userId',
  authenticateToken,
  controller.getEquipamentosDashboard.bind(controller)
);

router.post(
  '/usuario-equipamento-dashboard',
  authenticateToken,
  controller.addEquipamentoToDashboard.bind(controller)
);

router.delete(
  '/usuario-equipamento-dashboard/:userId/:equipamentoId',
  authenticateToken,
  controller.removeEquipamentoFromDashboard.bind(controller)
);

router.get(
  '/usuario-equipamento-dashboard/:userId/:equipamentoId/check',
  authenticateToken,
  controller.checkEquipamentoInDashboard.bind(controller)
);

export default router;


