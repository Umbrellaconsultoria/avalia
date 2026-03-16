import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Adicionando a validação do GOV BR (authenticateToken) nos endpoints
router.post('/', authenticateToken, eventController.create);
router.get('/', authenticateToken, eventController.list);
router.get('/:id', authenticateToken, eventController.getById);

export default router;
