import { Router } from 'express';
import { certificateController } from '../controllers/certificate.controller';
import { authenticateLocalToken } from '../middlewares/localAuth.middleware';

const router = Router();

// Rota restrita ao participante logado para baixar seu proprio certificado
router.get('/:eventId', authenticateLocalToken, certificateController.generate);

// Rota administrativa para emitir certificado de qualquer participante
router.get('/admin/:eventId/:identifier', authenticateLocalToken, certificateController.generateAdmin);

export default router;
