import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticateLocalToken } from '../middlewares/localAuth.middleware';

const router = Router();

// Todas as rotas de empresa precisam do login Gov Br
router.post('/', authenticateLocalToken, companyController.create);
router.get('/', authenticateLocalToken, companyController.list);
router.get('/:id', authenticateLocalToken, companyController.getById);
router.patch('/:id', authenticateLocalToken, companyController.update);
router.delete('/:id', authenticateLocalToken, companyController.delete);

export default router;
