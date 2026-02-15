import { Router } from 'express';
import { SupportTicketController } from '../controllers/supportTicketController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateTenant } from '../middlewares/tenantMiddleware';

const router = Router();
const supportTicketController = new SupportTicketController();

// Rotas com autenticação JWT e validação de tenant
router.get(
  '/suport/user',
  authenticateToken,
  validateTenant,
  supportTicketController.getTicketsByUser.bind(supportTicketController)
);

router.get(
  '/suport/:id',
  authenticateToken,
  validateTenant,
  supportTicketController.getTicketById.bind(supportTicketController)
);

router.post(
  '/suport',
  authenticateToken,
  validateTenant,
  supportTicketController.createTicket.bind(supportTicketController)
);

router.put(
  '/suport/:id',
  authenticateToken,
  validateTenant,
  supportTicketController.updateTicket.bind(supportTicketController)
);

export default router;
