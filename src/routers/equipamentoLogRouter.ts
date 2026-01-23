import { Router } from 'express';
import { EquipamentoLogController } from '../controllers/equipamentoLogController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authenticateEquipamento } from '../middlewares/equipamentoAuthMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const equipamentoLogController = new EquipamentoLogController();

// Rotas para usuários (JWT) - gerenciamento via frontend
router.get(
  '/equipamento-logs/table/:id',
  authenticateToken,
  validateTenant,
  equipamentoLogController.getLogsTableData.bind(equipamentoLogController)
);

// Rota para equipamentos (API Key) - recebimento de logs dos microcontroladores
// Não precisa de validateTenant pois o equipamento já está autenticado via API Key
router.post(
  '/equipamento-logs/receive',
  authenticateEquipamento,
  equipamentoLogController.receiveLogsFromEquipamento.bind(equipamentoLogController)
);

export default router;
