import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticateLocalToken } from '../middlewares/localAuth.middleware';

const router = Router();

// Rota pública para obter detalhes básicos do evento (usada na página de avaliação anônima)
router.get('/p/:id', eventController.getPublicById);

// Usando autenticação local por e-mail/senha
router.post('/', authenticateLocalToken, eventController.create);
router.get('/', authenticateLocalToken, eventController.list);
router.get('/:id', authenticateLocalToken, eventController.getById);
router.patch('/:id', authenticateLocalToken, eventController.update);
router.delete('/:id', authenticateLocalToken, eventController.delete);

router.get('/test-route', (req, res) => {
  res.json({ message: 'Events router is working' });
});

export default router;
