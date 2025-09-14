import { Router } from 'express';
import { DeliveryController } from './delivery.controller';
import { validateQuery } from '../../utils/validation';
import { schemas } from '../../utils/validation';

const router = Router();

// Public routes for vendor callbacks
router.post('/receipt', DeliveryController.processReceipt);
router.post('/receipt/batch', DeliveryController.processReceiptBatch);

// Protected routes (if needed)
// router.use(authenticateToken);

// Delivery stats and logs
router.get('/stats', DeliveryController.getDeliveryStats);
router.get('/logs', validateQuery(schemas.pagination), DeliveryController.getDeliveryLogs);
router.post('/retry/:logId', DeliveryController.retryFailedDelivery);

export default router;
