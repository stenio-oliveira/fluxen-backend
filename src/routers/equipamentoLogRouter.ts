import { Router } from 'express';
import { EquipamentoLogController } from '../controllers/equipamentoLogController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authenticateEquipamento } from '../middlewares/equipamentoAuthMiddleware';

const router = Router();
const equipamentoLogController = new EquipamentoLogController();

// Rotas para usuários (JWT) - gerenciamento via frontend
router.get('/equipamento-logs/table/:id', authenticateToken, equipamentoLogController.getLogsTableData.bind(equipamentoLogController));

// Rota para equipamentos (API Key) - recebimento de logs dos microcontroladores
router.post('/equipamento-logs/receive', authenticateEquipamento, equipamentoLogController.receiveLogsFromEquipamento.bind(equipamentoLogController));

export default router;
