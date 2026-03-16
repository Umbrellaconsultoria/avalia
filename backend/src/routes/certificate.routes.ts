import { Router } from 'express';
import { certificateController } from '../controllers/certificate.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rota restrita ao participante logado para baixar seu proprio certificado
router.get('/:eventId', authenticateToken, certificateController.generate);

export default router;
