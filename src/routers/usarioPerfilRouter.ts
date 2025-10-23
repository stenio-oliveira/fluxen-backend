import { Router } from 'express';
import { UsuarioPerfilController } from '../controllers/usuarioPerfilController';

const router = Router();
const usuarioPerfilController = new UsuarioPerfilController();

router.get('/usuario-perfis', usuarioPerfilController.getUsuarioPerfis.bind(usuarioPerfilController));
router.get('/usuario-perfis/:id', usuarioPerfilController.getUsuarioPerfilById.bind(usuarioPerfilController));
router.post('/usuario-perfis', usuarioPerfilController.createUsuarioPerfil.bind(usuarioPerfilController));
router.put('/usuario-perfis/:id', usuarioPerfilController.updateUsuarioPerfil.bind(usuarioPerfilController));
router.delete('/usuario-perfis/:id', usuarioPerfilController.deleteUsuarioPerfil.bind(usuarioPerfilController));

export default router;
