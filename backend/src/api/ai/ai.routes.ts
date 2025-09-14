import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../../utils/validation';
import { schemas } from '../../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// AI-powered features
router.post('/parse-rules', validate(schemas.ai.ruleParser), AIController.parseNaturalLanguageToRules);
router.post('/message-suggestions', validate(schemas.ai.messageSuggestion), AIController.generateMessageSuggestions);
router.get('/performance-summary/:campaignId', AIController.generatePerformanceSummary);
router.post('/suggest-scheduling', AIController.suggestOptimalScheduling);
router.get('/lookalike-audience/:segmentId', AIController.generateLookalikeAudience);
router.get('/auto-tag/:campaignId', AIController.autoTagCampaign);

export default router;
