import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de empresa precisam do login Gov Br
router.post('/', authenticateToken, companyController.create);
router.get('/', authenticateToken, companyController.list);

export default router;
