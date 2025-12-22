import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const clienteController = new ClienteController();

// Rotas com autenticação JWT
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas com parâmetros dinâmicos
router.get(
  "/clientes/manager",
  authenticateToken,
  clienteController.getClientesByManager.bind(clienteController)
);
router.get(
  "/clientes",
  authenticateToken,
  clienteController.getClientes.bind(clienteController)
);
router.get(
  "/clientes/:id",
  authenticateToken,
  clienteController.getClienteById.bind(clienteController)
);
router.post(
  "/clientes",
  authenticateToken,
  clienteController.createCliente.bind(clienteController)
);
router.put(
  "/clientes/:id",
  authenticateToken,
  clienteController.updateCliente.bind(clienteController)
);
router.delete(
  "/clientes/:id",
  authenticateToken,
  clienteController.deleteCliente.bind(clienteController)
);

export default router;

