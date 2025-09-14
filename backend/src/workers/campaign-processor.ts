import { prisma } from '../config/database';
import { MessageQueueService } from '../services/messageQueue.service';
import { DeliveryService } from '../services/delivery.service';
import { logger } from '../utils/logger';

export class CampaignProcessor {
  private static isRunning = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  static async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Campaign processor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting campaign processor...');

    // Process messages every 10 seconds
    this.processingInterval = setInterval(async () => {
      await this.processMessages();
    }, 10000);

    // Process messages immediately
    await this.processMessages();
  }

  static async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Campaign processor is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    logger.info('Campaign processor stopped');
  }

  private static async processMessages(): Promise<void> {
    try {
      const message = await MessageQueueService.getNextMessage('campaign_process');
      
      if (!message) {
        return;
      }

      logger.info('Processing campaign message:', { messageId: message.id });

      try {
        const { campaignId, userId, message: campaignMessage, customerIds } = message.payload;

        // Update campaign status to running
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'running',
            startedAt: new Date(),
          },
        });

        // Create communication logs for each customer
        await Promise.all(
          customerIds.map(async (customerId: string) => {
            return await DeliveryService.sendMessage(
              campaignId,
              customerId,
              userId,
              campaignMessage
            );
          })
        );

        // Update campaign status to completed
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });

        await MessageQueueService.markMessageCompleted(message.id);
        logger.info('Campaign processed successfully:', { 
          campaignId, 
          messageId: message.id,
          customerCount: customerIds.length 
        });
      } catch (error) {
        logger.error('Failed to process campaign message:', { messageId: message.id, error: error as Error });
        
        // Update campaign status to failed
        try {
          await prisma.campaign.update({
            where: { id: message.payload.campaignId },
            data: {
              status: 'failed',
            },
          });
        } catch (updateError) {
          logger.error('Failed to update campaign status to failed:', updateError);
        }

        await MessageQueueService.markMessageFailed(message.id, (error as Error).message);
      }
    } catch (error) {
      logger.error('Error processing campaign messages:', error as Error);
    }
  }

  static async getStatus(): Promise<{ running: boolean; processed: number; failed: number }> {
    try {
      const stats = await MessageQueueService.getQueueStats('campaign_process');
      
      return {
        running: this.isRunning,
        processed: stats.completed,
        failed: stats.failed,
      };
    } catch (error) {
      logger.error('Failed to get campaign processor status:', error as Error);
      return {
        running: this.isRunning,
        processed: 0,
        failed: 0,
      };
    }
  }
}
