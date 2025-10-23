import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';

const router = Router();
const usuarioController = new UsuarioController();

router.get('/usuarios', usuarioController.getUsuarios.bind(usuarioController));
router.get("/usuarios/equipamentos/:id_equipamento",usuarioController.getClienteByEquipamentoId.bind(usuarioController));

router.get(
  "/usuarios/:id",
  usuarioController.getUsuarioById.bind(usuarioController)
);
router.get(
  "/usuarios/perfil/clientes",
  usuarioController.getClientUsers.bind(usuarioController)
);

router.post(
  "/usuarios",
  usuarioController.createUsuario.bind(usuarioController)
);
router.put(
  "/usuarios/:id",
  usuarioController.updateUsuario.bind(usuarioController)
);
router.delete(
  "/usuarios/:id",
  usuarioController.deleteUsuario.bind(usuarioController)
);

export default router;
