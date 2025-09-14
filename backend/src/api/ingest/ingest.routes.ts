import { Router } from 'express';
import { IngestController } from './ingest.controller';
import { validate } from '../../utils/validation';
import { schemas } from '../../utils/validation';

const router = Router();

// Customer ingestion routes
router.post('/customers', validate(schemas.customer.create), IngestController.createCustomer);
router.post('/customers/async', validate(schemas.customer.create), IngestController.createCustomerAsync);
router.post('/customers/batch', IngestController.createCustomersBatch);
router.post('/customers/batch/async', IngestController.createCustomersBatchAsync);

// Order ingestion routes
router.post('/orders', validate(schemas.order.create), IngestController.createOrder);
router.post('/orders/async', validate(schemas.order.create), IngestController.createOrderAsync);
router.post('/orders/batch', IngestController.createOrdersBatch);
router.post('/orders/batch/async', IngestController.createOrdersBatchAsync);

// Health and stats routes
router.get('/health', IngestController.healthCheck);
router.get('/stats', IngestController.getStats);

export default router;
