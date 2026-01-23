import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const clienteController = new ClienteController();

// Rotas com autenticação JWT e validação de tenant
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas com parâmetros dinâmicos
router.get(
  "/clientes/manager",
  authenticateToken,
  validateTenant,
  clienteController.getClientesByManager.bind(clienteController)
);
router.get(
  "/clientes",
  authenticateToken,
  validateTenant,
  clienteController.getClientes.bind(clienteController)
);
router.get(
  "/clientes/:id",
  authenticateToken,
  validateTenant,
  clienteController.getClienteById.bind(clienteController)
);
router.post(
  "/clientes",
  authenticateToken,
  validateTenant,
  clienteController.createCliente.bind(clienteController)
);
router.put(
  "/clientes/:id",
  authenticateToken,
  validateTenant,
  clienteController.updateCliente.bind(clienteController)
);
router.delete(
  "/clientes/:id",
  authenticateToken,
  validateTenant,
  clienteController.deleteCliente.bind(clienteController)
);

export default router;

