import { Router } from 'express';
import { EquipamentoLogController } from '../controllers/equipamentoLogController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authenticateEquipamento } from '../middlewares/equipamentoAuthMiddleware';

const router = Router();
const equipamentoLogController = new EquipamentoLogController();

// Rotas para usuários (JWT) - gerenciamento via frontend
router.get('/equipamento-logs', authenticateToken, equipamentoLogController.getEquipamentoLogs.bind(equipamentoLogController));
router.get('/equipamento-logs/:id', authenticateToken, equipamentoLogController.getEquipamentoLogById.bind(equipamentoLogController));
router.post('/equipamento-logs', authenticateToken, equipamentoLogController.createManyEquipamentoLogs.bind(equipamentoLogController));
router.put('/equipamento-logs/:id', authenticateToken, equipamentoLogController.updateEquipamentoLog.bind(equipamentoLogController));
router.delete('/equipamento-logs/:id', authenticateToken, equipamentoLogController.deleteEquipamentoLog.bind(equipamentoLogController));

// Rota para equipamentos (API Key) - recebimento de logs dos microcontroladores
router.post('/equipamento-logs/receive', authenticateEquipamento, equipamentoLogController.receiveLogsFromEquipamento.bind(equipamentoLogController));

export default router;
