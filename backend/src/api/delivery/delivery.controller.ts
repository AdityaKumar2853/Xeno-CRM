import { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../../services/delivery.service';
import { asyncHandler } from '../../utils/errorHandler';
import { validateQuery } from '../../utils/validation';
import { schemas } from '../../utils/validation';
import { logger } from '../../utils/logger';

export class DeliveryController {
  static getDeliveryStats = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.query;
    const stats = await DeliveryService.getDeliveryStats(campaignId as string);

    res.json({
      success: true,
      data: { stats },
    });
  });

  static getDeliveryLogs = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId, page = 1, limit = 10, status } = req.query;
    
    const result = await DeliveryService.getDeliveryLogs(
      campaignId as string,
      Number(page),
      Number(limit),
      status as string
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static retryFailedDelivery = asyncHandler(async (req: Request, res: Response) => {
    const { logId } = req.params;
    await DeliveryService.retryFailedDelivery(logId);

    res.json({
      success: true,
      message: 'Delivery queued for retry',
    });
  });

  static processReceipt = asyncHandler(async (req: Request, res: Response) => {
    const { logId, vendorId, status } = req.body;

    if (!logId || !vendorId || !status) {
      return res.status(400).json({
        success: false,
        error: { message: 'logId, vendorId, and status are required' },
      });
    }

    if (!['delivered', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status must be either delivered or failed' },
      });
    }

    await DeliveryService.processReceipt(logId, vendorId, status);

    res.json({
      success: true,
      message: 'Delivery receipt processed successfully',
    });
  });

  static processReceiptBatch = asyncHandler(async (req: Request, res: Response) => {
    const { receipts } = req.body;

    if (!Array.isArray(receipts) || receipts.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Receipts array is required and must not be empty' },
      });
    }

    if (receipts.length > 100) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum 100 receipts allowed per batch' },
      });
    }

    // Validate each receipt
    for (const receipt of receipts) {
      if (!receipt.logId || !receipt.vendorId || !receipt.status) {
        return res.status(400).json({
          success: false,
          error: { message: 'Each receipt must have logId, vendorId, and status' },
        });
      }

      if (!['delivered', 'failed'].includes(receipt.status)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Status must be either delivered or failed' },
        });
      }
    }

    await DeliveryService.processReceiptBatch(receipts);

    res.json({
      success: true,
      message: 'Batch delivery receipts processed successfully',
    });
  });
}
