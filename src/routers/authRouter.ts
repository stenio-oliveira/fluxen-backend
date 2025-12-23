import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { PasswordResetController } from '../controllers/passwordResetController';

const router = Router();
const authController = new AuthController();
const passwordResetController = new PasswordResetController();

router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));
router.post('/auth/forgot-password', passwordResetController.requestPasswordReset.bind(passwordResetController));
router.post('/auth/reset-password', passwordResetController.resetPassword.bind(passwordResetController));
router.get('/auth/validate-reset-token', passwordResetController.validateToken.bind(passwordResetController));

export default router;
