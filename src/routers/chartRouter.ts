import { Router } from 'express';
import { ChartController } from '../controllers/chartController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const chartController = new ChartController();

// Rotas para gráficos (requerem autenticação JWT)
router.get(
  '/charts/line/:id_equipamento/:id_metrica',
  authenticateToken,
  chartController.getLineChartData.bind(chartController)
);

router.get(
  '/charts/doughnut/:id_equipamento/:id_metrica',
  authenticateToken,
  chartController.getDoughnutChartData.bind(chartController)
);

router.get(
  '/charts/bar/:id_equipamento/:id_metrica',
  authenticateToken,
  chartController.getBarChartData.bind(chartController)
);

export default router;

