import { Router } from 'express';
import { evaluationController } from '../controllers/evaluation.controller';
import { authenticateLocalToken } from '../middlewares/localAuth.middleware';

const router = Router();

// Listar avaliações (Filtrado por empresa no controller)
router.get('/', authenticateLocalToken, evaluationController.list);

// Rota pública para participantes (Sem autenticação)
router.post('/public', evaluationController.createPublic);

// Participante autenticado avalia e marca presença
router.post('/', authenticateLocalToken, evaluationController.create);

export default router;
