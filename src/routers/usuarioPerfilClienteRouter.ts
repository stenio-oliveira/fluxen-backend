import { Router } from 'express';
import { UsuarioPerfilClienteController } from '../controllers/usuarioPerfilClienteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const controller = new UsuarioPerfilClienteController();

router.get(
  '/usuarios/:id_usuario/relacionamentos',
  authenticateToken,
  controller.getRelacionamentosByUsuario.bind(controller)
);

router.put(
  '/usuarios/:id_usuario/relacionamentos',
  authenticateToken,
  controller.updateRelacionamentos.bind(controller)
);

router.get(
  '/clientes/:id_cliente/relacionamentos',
  authenticateToken,
  controller.getRelacionamentosByCliente.bind(controller)
);

router.put(
  '/clientes/:id_cliente/relacionamentos',
  authenticateToken,
  controller.updateRelacionamentosByCliente.bind(controller)
);

export default router;

