import { Router } from 'express';
import { PerfilController } from '../controllers/perfilController';

const router = Router();
const perfilController = new PerfilController();

router.get('/perfis', perfilController.getPerfis);
router.get('/perfis/:id', perfilController.getPerfilById);
router.post('/perfis', perfilController.createPerfil);
router.put('/perfis/:id', perfilController.updatePerfil);
router.delete('/perfis/:id', perfilController.deletePerfil);

export default router;
