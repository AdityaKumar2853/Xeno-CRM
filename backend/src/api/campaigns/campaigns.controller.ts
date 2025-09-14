import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../../services/campaign.service';
import { asyncHandler } from '../../utils/errorHandler';
import { validate, validateQuery } from '../../utils/validation';
import { schemas } from '../../utils/validation';
import { logger } from '../../utils/logger';

export class CampaignsController {
  static createCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const campaign = await CampaignService.createCampaign({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: { campaign },
      message: 'Campaign created successfully',
    });
  });

  static getCampaigns = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const result = await CampaignService.getCampaigns(
      req.user.id,
      Number(page),
      Number(limit),
      status as string,
      search as string
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static getCampaignById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const campaign = await CampaignService.getCampaignById(id, req.user.id);

    res.json({
      success: true,
      data: { campaign },
    });
  });

  static updateCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const campaign = await CampaignService.updateCampaign(id, req.user.id, req.body);

    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign updated successfully',
    });
  });

  static deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    await CampaignService.deleteCampaign(id, req.user.id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  });

  static startCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const campaign = await CampaignService.startCampaign(id, req.user.id);

    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign started successfully',
    });
  });

  static pauseCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const campaign = await CampaignService.pauseCampaign(id, req.user.id);

    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign paused successfully',
    });
  });

  static resumeCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const campaign = await CampaignService.resumeCampaign(id, req.user.id);

    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign resumed successfully',
    });
  });

  static cancelCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const campaign = await CampaignService.cancelCampaign(id, req.user.id);

    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign cancelled successfully',
    });
  });

  static scheduleCampaign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        error: { message: 'Scheduled time is required' },
      });
    }

    const campaign = await CampaignService.scheduleCampaign(
      id, 
      req.user.id, 
      new Date(scheduledAt)
    );

    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign scheduled successfully',
    });
  });

  static getCampaignStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const stats = await CampaignService.getCampaignStats(id, req.user.id);

    res.json({
      success: true,
      data: { stats },
    });
  });

  static getCampaignLogs = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const result = await CampaignService.getCampaignLogs(
      id,
      req.user.id,
      Number(page),
      Number(limit),
      status as string
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static getCampaignInsights = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const insights = await CampaignService.getCampaignInsights(id, req.user.id);

    res.json({
      success: true,
      data: { insights },
    });
  });
}
