import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Customer routes
router.get('/', CustomerController.getCustomers);
router.get('/stats', CustomerController.getCustomerStats);
router.get('/search', CustomerController.searchCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.post('/', CustomerController.createCustomer);
router.put('/:id', CustomerController.updateCustomer);
router.delete('/:id', CustomerController.deleteCustomer);
router.get('/:id/orders', CustomerController.getCustomerOrders);

export default router;
