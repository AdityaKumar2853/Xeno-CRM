import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../../utils/validation';
import { schemas } from '../../utils/validation';

const router = Router();

// Public routes
router.post('/google', AuthController.googleLogin);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verifyToken);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.delete('/account', authenticateToken, AuthController.deleteAccount);

export default router;
