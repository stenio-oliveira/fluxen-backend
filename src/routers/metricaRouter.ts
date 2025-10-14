import { Router } from 'express';
import { MetricaController } from '../controllers/metricaController';

const router = Router();
const metricaController = new MetricaController();

router.get('/metricas', metricaController.getMetricas.bind(metricaController));
router.get('/metricas/:id', metricaController.getMetricaById.bind(metricaController));
router.get("/metricas/equipamentos/:id_equipamento",metricaController.getMetricaByEquipamentoId.bind(metricaController));

router.post(
  "/metricas/equipamentos/associar/:id_metrica/:id_equipamento",
  metricaController.associateMetricToEquipamento.bind(metricaController)
);

router.delete(
  "/metricas/equipamentos/desassociar/:id_metrica/:id_equipamento",
  metricaController.desassociateMetricToEquipamento.bind(metricaController)
)

router.post( "/metricas",metricaController.createMetrica.bind(metricaController));
router.put(
  "/metricas/:id",
  metricaController.updateMetrica.bind(metricaController)
);
router.delete(
  "/metricas/:id",
  metricaController.deleteMetrica.bind(metricaController)
);

export default router;
