import { Router } from 'express';
import { OrderController } from './orders.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Authentication disabled for test purposes
// router.use(authMiddleware);

// Order routes
router.get('/', OrderController.getOrders);
router.get('/stats', OrderController.getOrderStats);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

export default router;
