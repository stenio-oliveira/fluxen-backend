import { Router } from 'express';
import { EquipamentoController } from '../controllers/equipamentoController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const equipamentoController = new EquipamentoController();

// Rotas com autenticação JWT
router.get(
  "/equipamentos",
  authenticateToken,
  equipamentoController.getEquipamentos.bind(equipamentoController)
);
router.get(
  "/equipamentos/:id",
  authenticateToken,
  equipamentoController.getEquipamentoById.bind(equipamentoController)
);
router.post(
  "/equipamentos",
  authenticateToken,
  equipamentoController.createEquipamento.bind(equipamentoController)
);
router.put(
  "/equipamentos/:id",
  authenticateToken,
  equipamentoController.updateEquipamento.bind(equipamentoController)
);
router.delete(
  "/equipamentos/:id",
  authenticateToken,
  equipamentoController.deleteEquipamento.bind(equipamentoController)
);

// Rotas para gerenciar API Keys
router.post(
  "/equipamentos/:id/generate-api-key",
  authenticateToken,
  equipamentoController.generateApiKey.bind(equipamentoController)
);
router.post(
  "/equipamentos/:id/regenerate-api-key",
  authenticateToken,
  equipamentoController.regenerateApiKey.bind(equipamentoController)
);

export default router;
