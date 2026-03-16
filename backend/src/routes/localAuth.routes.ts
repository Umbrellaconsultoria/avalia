import { Router } from 'express';
import { localAuthController } from '../controllers/localAuth.controller';
import { authenticateLocalToken } from '../middlewares/localAuth.middleware';

const router = Router();

router.post('/register', localAuthController.register);
router.post('/login', localAuthController.login);
router.get('/me', authenticateLocalToken, localAuthController.me);

export default router;
