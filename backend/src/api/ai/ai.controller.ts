import { Request, Response, NextFunction } from 'express';
import { AIService } from '../../services/ai.service';
import { asyncHandler } from '../../utils/errorHandler';
import { validate } from '../../utils/validation';
import { schemas } from '../../utils/validation';
import { logger } from '../../utils/logger';

export class AIController {
  static parseNaturalLanguageToRules = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: { message: 'Prompt is required' },
      });
    }

    const result = await AIService.parseNaturalLanguageToRules(prompt);

    res.json({
      success: true,
      data: result,
    });
  });

  static generateMessageSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const { campaignObjective, audienceDescription, tone } = req.body;

    if (!campaignObjective) {
      return res.status(400).json({
        success: false,
        error: { message: 'Campaign objective is required' },
      });
    }

    const result = await AIService.generateMessageSuggestions(
      campaignObjective,
      audienceDescription,
      tone
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static generatePerformanceSummary = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Campaign ID is required' },
      });
    }

    const result = await AIService.generatePerformanceSummary(campaignId);

    res.json({
      success: true,
      data: result,
    });
  });

  static suggestOptimalScheduling = asyncHandler(async (req: Request, res: Response) => {
    const { customerIds } = req.body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Customer IDs array is required' },
      });
    }

    const result = await AIService.suggestOptimalScheduling(customerIds);

    res.json({
      success: true,
      data: result,
    });
  });

  static generateLookalikeAudience = asyncHandler(async (req: Request, res: Response) => {
    const { segmentId } = req.params;

    if (!segmentId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Segment ID is required' },
      });
    }

    const result = await AIService.generateLookalikeAudience(segmentId);

    res.json({
      success: true,
      data: result,
    });
  });

  static autoTagCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Campaign ID is required' },
      });
    }

    const result = await AIService.autoTagCampaign(campaignId);

    res.json({
      success: true,
      data: result,
    });
  });
}
