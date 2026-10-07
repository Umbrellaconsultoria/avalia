import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateLocalToken } from '../middlewares/localAuth.middleware';

const router = Router();

// Apenas Admin pode gerenciar usuários por enquanto
router.use(authenticateLocalToken);
router.use((req, res, next) => {
  if (req.user?.internalRole !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    return;
  }
  next();
});

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.patch('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
