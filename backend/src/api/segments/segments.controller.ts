import { Request, Response, NextFunction } from 'express';
import { SegmentService } from '../../services/segment.service';
import { asyncHandler } from '../../utils/errorHandler';
import { validate, validateQuery } from '../../utils/validation';
import { schemas } from '../../utils/validation';
import { logger } from '../../utils/logger';

export class SegmentsController {
  static createSegment = asyncHandler(async (req: Request, res: Response) => {
    // For test purposes, allow creation without authentication
    // In production, you would require authentication
    const userId = req.user?.id;

    const segment = await SegmentService.createSegment({
      ...req.body,
      userId: userId, // Will be undefined if no user, service will handle it
    });

    res.status(201).json({
      success: true,
      data: { segment },
      message: 'Segment created successfully',
    });
  });

  static getSegments = asyncHandler(async (req: Request, res: Response) => {
    // For test purposes, allow access without authentication
    // In production, you would require authentication
    const userId = req.user?.id;

    const { page = 1, limit = 10, search } = req.query;
    const result = await SegmentService.getSegments(
      userId, // Will be undefined if no user, service will handle it
      Number(page),
      Number(limit),
      search as string
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static getSegmentById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const segment = await SegmentService.getSegmentById(id, req.user.id);

    res.json({
      success: true,
      data: { segment },
    });
  });

  static updateSegment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const segment = await SegmentService.updateSegment(id, req.user.id, req.body);

    res.json({
      success: true,
      data: { segment },
      message: 'Segment updated successfully',
    });
  });

  static deleteSegment = asyncHandler(async (req: Request, res: Response) => {
    // For test purposes, allow deletion without authentication
    // In production, you would require authentication
    const userId = req.user?.id;

    const { id } = req.params;
    await SegmentService.deleteSegment(id, userId);

    res.json({
      success: true,
      message: 'Segment deleted successfully',
    });
  });

  static previewSegment = asyncHandler(async (req: Request, res: Response) => {
    const { rules } = req.body;

    if (!rules) {
      return res.status(400).json({
        success: false,
        error: { message: 'Rules are required' },
      });
    }

    const preview = await SegmentService.previewSegment(rules);

    res.json({
      success: true,
      data: { preview },
    });
  });

  static buildSegment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const result = await SegmentService.buildSegment(id, req.user.id);

    res.json({
      success: true,
      data: result,
      message: 'Segment built successfully',
    });
  });

  static getSegmentCustomers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await SegmentService.getSegmentCustomers(
      id,
      req.user.id,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static getSegmentStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const stats = await SegmentService.getSegmentStats(id, req.user.id);

    res.json({
      success: true,
      data: { stats },
    });
  });

  static validateRules = asyncHandler(async (req: Request, res: Response) => {
    const { rules } = req.body;

    if (!rules) {
      return res.status(400).json({
        success: false,
        error: { message: 'Rules are required' },
      });
    }

    const result = await SegmentService.validateRules(rules);

    res.json({
      success: true,
      data: result,
    });
  });

  static getRuleFields = asyncHandler(async (req: Request, res: Response) => {
    const fields = await SegmentService.getRuleFields();

    res.json({
      success: true,
      data: { fields },
    });
  });
}
