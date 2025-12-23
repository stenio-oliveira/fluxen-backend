import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ReportController();

router.post(
  '/equipamentos/:id_equipamento/reports',
  authenticateToken,
  controller.requestReport.bind(controller)
);

export default router;

