import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';
import { MessageQueueService } from './messageQueue.service';
import { config } from '../config/app';
import axios from 'axios';

export interface DeliveryReceipt {
  vendorId: string;
  status: 'delivered' | 'failed';
  deliveredAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export interface VendorResponse {
  success: boolean;
  vendorId: string;
  message?: string;
  error?: string;
}

export class DeliveryService {
  static async sendMessage(
    campaignId: string,
    customerId: string,
    userId: string,
    message: string
  ): Promise<string> {
    try {
      // Create communication log entry
      const log = await prisma.communicationLog.create({
        data: {
          campaignId,
          customerId,
          userId,
          message,
          status: 'pending',
        },
      });

      // Queue delivery
      await MessageQueueService.addToQueue('delivery_send', {
        logId: log.id,
        campaignId,
        customerId,
        userId,
        message,
      });

      logger.info('Message queued for delivery:', { logId: log.id, campaignId, customerId });

      return log.id;
    } catch (error) {
      logger.error('Failed to queue message for delivery:', error as Error);
      throw error;
    }
  }

  static async processDelivery(logId: string): Promise<void> {
    try {
      const log = await prisma.communicationLog.findUnique({
        where: { id: logId },
        include: {
          customer: true,
          campaign: true,
        },
      });

      if (!log) {
        throw errors.NOT_FOUND('Communication log not found');
      }

      if (log.status !== 'pending') {
        logger.warn('Communication log already processed:', { logId, status: log.status });
        return;
      }

      // Update status to sent
      await prisma.communicationLog.update({
        where: { id: logId },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });

      // Send to vendor API
      const vendorResponse = await this.sendToVendor(log);

      if (vendorResponse.success) {
        // Queue receipt processing
        await MessageQueueService.addToQueue('receipt_process', {
          logId,
          vendorId: vendorResponse.vendorId,
          status: 'delivered',
        });

        logger.info('Message sent to vendor successfully:', { logId, vendorId: vendorResponse.vendorId });
      } else {
        // Mark as failed
        await prisma.communicationLog.update({
          where: { id: logId },
          data: {
            status: 'failed',
            failedAt: new Date(),
            failureReason: vendorResponse.error || 'Vendor API error',
          },
        });

        logger.error('Message delivery failed:', { logId, error: vendorResponse.error });
      }
    } catch (error) {
      logger.error('Failed to process delivery:', error as Error);
      
      // Mark as failed
      try {
        await prisma.communicationLog.update({
          where: { id: logId },
          data: {
            status: 'failed',
            failedAt: new Date(),
            failureReason: error.message,
          },
        });
      } catch (updateError) {
        logger.error('Failed to update communication log status:', updateError);
      }

      throw error;
    }
  }

  static async processReceipt(logId: string, vendorId: string, status: string): Promise<void> {
    try {
      const log = await prisma.communicationLog.findUnique({
        where: { id: logId },
      });

      if (!log) {
        throw errors.NOT_FOUND('Communication log not found');
      }

      const updateData: any = {
        vendorId,
        updatedAt: new Date(),
      };

      if (status === 'delivered') {
        updateData.status = 'delivered';
        updateData.deliveredAt = new Date();
      } else if (status === 'failed') {
        updateData.status = 'failed';
        updateData.failedAt = new Date();
        updateData.failureReason = 'Delivery failed';
      }

      await prisma.communicationLog.update({
        where: { id: logId },
        data: updateData,
      });

      logger.info('Delivery receipt processed:', { logId, vendorId, status });
    } catch (error) {
      logger.error('Failed to process delivery receipt:', error as Error);
      throw error;
    }
  }

  static async processReceiptBatch(receipts: { logId: string; vendorId: string; status: string }[]): Promise<void> {
    try {
      const updatePromises = receipts.map(receipt => 
        this.processReceipt(receipt.logId, receipt.vendorId, receipt.status)
      );

      await Promise.all(updatePromises);

      logger.info('Batch delivery receipts processed:', { count: receipts.length });
    } catch (error) {
      logger.error('Failed to process batch delivery receipts:', error as Error);
      throw error;
    }
  }

  private static async sendToVendor(log: any): Promise<VendorResponse> {
    try {
      const response = await axios.post(
        `${config.apis.vendorApiUrl}/vendor/send`,
        {
          customerId: log.customer.id,
          customerName: log.customer.name,
          customerEmail: log.customer.email,
          message: log.message,
          campaignId: log.campaignId,
        },
        {
          timeout: config.vendor.timeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mini-CRM/1.0',
          },
        }
      );

      return {
        success: true,
        vendorId: response.data.vendorId,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Vendor API error:', error as Error);
      
      return {
        success: false,
        vendorId: '',
        error: (error as Error).message,
      };
    }
  }

  static async getDeliveryStats(campaignId?: string): Promise<any> {
    try {
      const where = campaignId ? { campaignId } : {};

      const [
        totalSent,
        totalDelivered,
        totalFailed,
        totalPending,
        deliveryRate,
      ] = await Promise.all([
        prisma.communicationLog.count({
          where: { ...where, status: 'sent' },
        }),
        prisma.communicationLog.count({
          where: { ...where, status: 'delivered' },
        }),
        prisma.communicationLog.count({
          where: { ...where, status: 'failed' },
        }),
        prisma.communicationLog.count({
          where: { ...where, status: 'pending' },
        }),
        prisma.communicationLog.aggregate({
          where: { ...where, status: { in: ['sent', 'delivered', 'failed'] } },
          _count: { id: true },
        }),
        prisma.communicationLog.aggregate({
          where: { ...where, status: 'failed' },
          _count: { id: true },
        }),
      ]);

      const totalProcessed = deliveryRate._count.id;
      const deliveredCount = totalDelivered;
      const failedCount = totalFailed;

      return {
        totalSent,
        totalDelivered: deliveredCount,
        totalFailed: failedCount,
        totalPending,
        deliveryRate: totalProcessed > 0 ? (deliveredCount / totalProcessed) * 100 : 0,
        failureRate: totalProcessed > 0 ? (failedCount / totalProcessed) * 100 : 0,
      };
    } catch (error) {
      logger.error('Failed to get delivery stats:', error as Error);
      throw error;
    }
  }

  static async getDeliveryLogs(
    campaignId?: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ logs: any[]; total: number; page: number; limit: number }> {
    try {
      const where: any = {};
      
      if (campaignId) {
        where.campaignId = campaignId;
      }
      
      if (status) {
        where.status = status;
      }

      const [logs, total] = await Promise.all([
        prisma.communicationLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            campaign: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.communicationLog.count({ where }),
      ]);

      return {
        logs,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get delivery logs:', error as Error);
      throw error;
    }
  }

  static async retryFailedDelivery(logId: string): Promise<void> {
    try {
      const log = await prisma.communicationLog.findUnique({
        where: { id: logId },
      });

      if (!log) {
        throw errors.NOT_FOUND('Communication log not found');
      }

      if (log.status !== 'failed') {
        throw errors.BAD_REQUEST('Only failed deliveries can be retried');
      }

      // Reset status and retry
      await prisma.communicationLog.update({
        where: { id: logId },
        data: {
          status: 'pending',
          failureReason: null,
          failedAt: null,
        },
      });

      // Queue for retry
      await MessageQueueService.addToQueue('delivery_send', {
        logId: log.id,
        campaignId: log.campaignId,
        customerId: log.customerId,
        userId: log.userId,
        message: log.message,
      });

      logger.info('Failed delivery queued for retry:', { logId });
    } catch (error) {
      logger.error('Failed to retry delivery:', error as Error);
      throw error;
    }
  }
}
