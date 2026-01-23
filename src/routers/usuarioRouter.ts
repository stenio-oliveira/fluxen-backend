import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const usuarioController = new UsuarioController();

router.get(
  '/usuarios',
  authenticateToken,
  validateTenant,
  usuarioController.getUsuarios.bind(usuarioController)
);
router.get(
  "/usuarios/equipamentos/:id_equipamento",
  authenticateToken,
  validateTenant,
  usuarioController.getClienteByEquipamentoId.bind(usuarioController)
);

router.get(
  "/usuarios/:id",
  authenticateToken,
  validateTenant,
  usuarioController.getUsuarioById.bind(usuarioController)
);

router.post(
  "/usuarios",
  authenticateToken,
  validateTenant,
  usuarioController.createUsuario.bind(usuarioController)
);
router.put(
  "/usuarios/:id",
  authenticateToken,
  validateTenant,
  usuarioController.updateUsuario.bind(usuarioController)
);
router.delete(
  "/usuarios/:id",
  authenticateToken,
  validateTenant,
  usuarioController.deleteUsuario.bind(usuarioController)
);

export default router;
