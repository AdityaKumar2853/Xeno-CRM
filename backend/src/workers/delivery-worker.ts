import { MessageQueueService } from '../services/messageQueue.service';
import { DeliveryService } from '../services/delivery.service';
import { logger } from '../utils/logger';

export class DeliveryWorker {
  private static isRunning = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  static async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Delivery worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting delivery worker...');

    // Process messages every 3 seconds
    this.processingInterval = setInterval(async () => {
      await this.processMessages();
    }, 3000);

    // Process messages immediately
    await this.processMessages();
  }

  static async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Delivery worker is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    logger.info('Delivery worker stopped');
  }

  private static async processMessages(): Promise<void> {
    try {
      const message = await MessageQueueService.getNextMessage('delivery_send');
      
      if (!message) {
        return;
      }

      logger.info('Processing delivery message:', { messageId: message.id });

      try {
        const { logId } = message.payload;
        await DeliveryService.processDelivery(logId);

        await MessageQueueService.markMessageCompleted(message.id);
        logger.info('Delivery message processed successfully:', { messageId: message.id });
      } catch (error) {
        logger.error('Failed to process delivery message:', { messageId: message.id, error });
        await MessageQueueService.markMessageFailed(message.id, error.message);
      }
    } catch (error) {
      logger.error('Error processing delivery messages:', error);
    }
  }

  static async getStatus(): Promise<{ running: boolean; processed: number; failed: number }> {
    try {
      const stats = await MessageQueueService.getQueueStats('delivery_send');
      
      return {
        running: this.isRunning,
        processed: stats.completed,
        failed: stats.failed,
      };
    } catch (error) {
      logger.error('Failed to get delivery worker status:', error);
      return {
        running: this.isRunning,
        processed: 0,
        failed: 0,
      };
    }
  }
}
