import { Router } from 'express';
import { UsuarioPerfilClienteController } from '../controllers/usuarioPerfilClienteController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const controller = new UsuarioPerfilClienteController();

router.get(
  '/usuarios/:id_usuario/relacionamentos',
  authenticateToken,
  validateTenant,
  controller.getRelacionamentosByUsuario.bind(controller)
);

router.put(
  '/usuarios/:id_usuario/relacionamentos',
  authenticateToken,
  validateTenant,
  controller.updateRelacionamentos.bind(controller)
);

router.get(
  '/clientes/:id_cliente/relacionamentos',
  authenticateToken,
  validateTenant,
  controller.getRelacionamentosByCliente.bind(controller)
);

router.put(
  '/clientes/:id_cliente/relacionamentos',
  authenticateToken,
  validateTenant,
  controller.updateRelacionamentosByCliente.bind(controller)
);

export default router;

