import { Router } from 'express';
import { UsuarioPerfilController } from '../controllers/usuarioPerfilController';

const router = Router();
const usuarioPerfilController = new UsuarioPerfilController();

router.get('/usuario-perfis', usuarioPerfilController.getUsuarioPerfis);
router.get('/usuario-perfis/:id', usuarioPerfilController.getUsuarioPerfilById);
router.post('/usuario-perfis', usuarioPerfilController.createUsuarioPerfil);
router.put('/usuario-perfis/:id', usuarioPerfilController.updateUsuarioPerfil);
router.delete('/usuario-perfis/:id', usuarioPerfilController.deleteUsuarioPerfil);

export default router;
