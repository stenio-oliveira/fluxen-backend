import { Router } from 'express';
import { EquipamentoMetricaController } from '../controllers/equipamentoMetricaController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const equipamentoMetricaController = new EquipamentoMetricaController();

router.get(
  '/equipamento_metricas',
  authenticateToken,
  validateTenant,
  equipamentoMetricaController.getEquipamentoMetricas.bind(equipamentoMetricaController)
);
router.get(
  '/equipamento_metricas/:id',
  authenticateToken,
  validateTenant,
  equipamentoMetricaController.getEquipamentoMetricaById.bind(equipamentoMetricaController)
);
router.post(
  '/equipamento_metricas',
  authenticateToken,
  validateTenant,
  equipamentoMetricaController.createEquipamentoMetrica.bind(equipamentoMetricaController)
);
router.put(
  '/equipamento_metricas/:id',
  authenticateToken,
  validateTenant,
  equipamentoMetricaController.updateEquipamentoMetrica.bind(equipamentoMetricaController)
);
router.delete(
  '/equipamento_metricas/:id',
  authenticateToken,
  validateTenant,
  equipamentoMetricaController.deleteEquipamentoMetrica.bind(equipamentoMetricaController)
);

export default router;
