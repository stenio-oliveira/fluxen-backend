import { Router } from 'express';
import { MetricaController } from '../controllers/metricaController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const metricaController = new MetricaController();

router.get('/metricas', authenticateToken, metricaController.getMetricas.bind(metricaController));
router.get('/metricas/stats', authenticateToken, metricaController.getMetricasStats.bind(metricaController));
router.get('/metricas/:id', authenticateToken, metricaController.getMetricaById.bind(metricaController));
router.get("/metricas/equipamentos/:id_equipamento", authenticateToken, metricaController.getMetricaByEquipamentoId.bind(metricaController));

router.post(
  "/metricas/equipamentos/associar/:id_metrica/:id_equipamento",
  authenticateToken,
  metricaController.associateMetricToEquipamento.bind(metricaController)
);

router.delete(
  "/metricas/equipamentos/desassociar/:id_metrica/:id_equipamento",
  authenticateToken,
  metricaController.desassociateMetricToEquipamento.bind(metricaController)
)

router.post("/metricas", authenticateToken, metricaController.createMetrica.bind(metricaController));
router.put(
  "/metricas/:id",
  authenticateToken,
  metricaController.updateMetrica.bind(metricaController)
);
router.delete(
  "/metricas/:id",
  authenticateToken,
  metricaController.deleteMetrica.bind(metricaController)
);

export default router;
