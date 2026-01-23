import { Router } from 'express';
import { MetricaController } from '../controllers/metricaController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const metricaController = new MetricaController();

router.get(
  '/metricas',
  authenticateToken,
  validateTenant,
  metricaController.getMetricas.bind(metricaController)
);
router.get(
  '/metricas/stats',
  authenticateToken,
  validateTenant,
  metricaController.getMetricasStats.bind(metricaController)
);
router.get(
  '/metricas/:id',
  authenticateToken,
  validateTenant,
  metricaController.getMetricaById.bind(metricaController)
);
router.get(
  "/metricas/equipamentos/:id_equipamento",
  authenticateToken,
  validateTenant,
  metricaController.getMetricaByEquipamentoId.bind(metricaController)
);

router.post(
  "/metricas/equipamentos/associar/:id_metrica/:id_equipamento",
  authenticateToken,
  validateTenant,
  metricaController.associateMetricToEquipamento.bind(metricaController)
);

router.delete(
  "/metricas/equipamentos/desassociar/:id_metrica/:id_equipamento",
  authenticateToken,
  validateTenant,
  metricaController.desassociateMetricToEquipamento.bind(metricaController)
)

router.post(
  "/metricas",
  authenticateToken,
  validateTenant,
  metricaController.createMetrica.bind(metricaController)
);
router.put(
  "/metricas/:id",
  authenticateToken,
  validateTenant,
  metricaController.updateMetrica.bind(metricaController)
);
router.delete(
  "/metricas/:id",
  authenticateToken,
  validateTenant,
  metricaController.deleteMetrica.bind(metricaController)
);

export default router;
