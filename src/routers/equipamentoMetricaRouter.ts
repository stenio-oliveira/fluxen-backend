import { Router } from 'express';
import { EquipamentoMetricaController } from '../controllers/equipamentoMetricaController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const equipamentoMetricaController = new EquipamentoMetricaController();

router.get('/equipamento_metricas', authenticateToken, equipamentoMetricaController.getEquipamentoMetricas.bind(equipamentoMetricaController));
router.get('/equipamento_metricas/:id', authenticateToken, equipamentoMetricaController.getEquipamentoMetricaById.bind(equipamentoMetricaController));
router.post('/equipamento_metricas', authenticateToken, equipamentoMetricaController.createEquipamentoMetrica.bind(equipamentoMetricaController));
router.put('/equipamento_metricas/:id', authenticateToken, equipamentoMetricaController.updateEquipamentoMetrica.bind(equipamentoMetricaController));
router.delete('/equipamento_metricas/:id', authenticateToken, equipamentoMetricaController.deleteEquipamentoMetrica.bind(equipamentoMetricaController));

export default router;
