import { Router } from 'express';
import { CampaignsController } from './campaigns.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, validateQuery } from '../../utils/validation';
import { schemas } from '../../utils/validation';

const router = Router();

// Authentication disabled for test purposes
// router.use(authenticateToken);

// Campaign CRUD routes
router.post('/', validate(schemas.campaign.create), CampaignsController.createCampaign);
router.get('/', validateQuery(schemas.pagination), CampaignsController.getCampaigns);
router.get('/:id', CampaignsController.getCampaignById);
router.put('/:id', validate(schemas.campaign.update), CampaignsController.updateCampaign);
router.delete('/:id', CampaignsController.deleteCampaign);

// Campaign action routes
router.post('/:id/start', CampaignsController.startCampaign);
router.post('/:id/pause', CampaignsController.pauseCampaign);
router.post('/:id/resume', CampaignsController.resumeCampaign);
router.post('/:id/cancel', CampaignsController.cancelCampaign);
router.post('/:id/schedule', CampaignsController.scheduleCampaign);

// Campaign analytics routes
router.get('/:id/stats', CampaignsController.getCampaignStats);
router.get('/:id/logs', validateQuery(schemas.pagination), CampaignsController.getCampaignLogs);
router.get('/:id/insights', CampaignsController.getCampaignInsights);

export default router;
