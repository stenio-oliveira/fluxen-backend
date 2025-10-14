import { Router } from 'express';
import { EquipamentoMetricaController } from '../controllers/equipamentoMetricaController';

const router = Router();
const equipamentoMetricaController = new EquipamentoMetricaController();

router.get('/equipamento_metricas', equipamentoMetricaController.getEquipamentoMetricas.bind(equipamentoMetricaController));
router.get('/equipamento_metricas/:id', equipamentoMetricaController.getEquipamentoMetricaById.bind(equipamentoMetricaController));
router.post('/equipamento_metricas', equipamentoMetricaController.createEquipamentoMetrica.bind(equipamentoMetricaController));
router.put('/equipamento_metricas/:id', equipamentoMetricaController.updateEquipamentoMetrica.bind(equipamentoMetricaController));
router.delete('/equipamento_metricas/:id', equipamentoMetricaController.deleteEquipamentoMetrica.bind(equipamentoMetricaController));

export default router;
