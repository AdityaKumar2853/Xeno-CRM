import { Router } from 'express';
import { SegmentsController } from './segments.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, validateQuery } from '../../utils/validation';
import { schemas } from '../../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Segment CRUD routes
router.post('/', validate(schemas.segment.create), SegmentsController.createSegment);
router.get('/', validateQuery(schemas.pagination), SegmentsController.getSegments);
router.get('/:id', SegmentsController.getSegmentById);
router.put('/:id', validate(schemas.segment.update), SegmentsController.updateSegment);
router.delete('/:id', SegmentsController.deleteSegment);

// Segment building and preview routes
router.post('/preview', SegmentsController.previewSegment);
router.post('/:id/build', SegmentsController.buildSegment);

// Segment customers and stats
router.get('/:id/customers', validateQuery(schemas.pagination), SegmentsController.getSegmentCustomers);
router.get('/:id/stats', SegmentsController.getSegmentStats);

// Rule validation and fields
router.post('/validate-rules', SegmentsController.validateRules);
router.get('/rule-fields', SegmentsController.getRuleFields);

export default router;
