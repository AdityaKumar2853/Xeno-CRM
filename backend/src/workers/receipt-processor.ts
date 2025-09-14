import { MessageQueueService } from '../services/messageQueue.service';
import { DeliveryService } from '../services/delivery.service';
import { logger } from '../utils/logger';

export class ReceiptProcessor {
  private static isRunning = false;
  private static processingInterval: NodeJS.Timeout | null = null;
  private static batchSize = 10;
  private static batchTimeout = 5000; // 5 seconds
  private static pendingReceipts: any[] = [];
  private static batchTimer: NodeJS.Timeout | null = null;

  static async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Receipt processor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting receipt processor...');

    // Process messages every 2 seconds
    this.processingInterval = setInterval(async () => {
      await this.processMessages();
    }, 2000);

    // Process messages immediately
    await this.processMessages();
  }

  static async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Receipt processor is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Process any remaining receipts
    if (this.pendingReceipts.length > 0) {
      await this.processBatch();
    }

    logger.info('Receipt processor stopped');
  }

  private static async processMessages(): Promise<void> {
    try {
      const message = await MessageQueueService.getNextMessage('receipt_process');
      
      if (!message) {
        return;
      }

      logger.info('Processing receipt message:', { messageId: message.id });

      try {
        const { logId, vendorId, status } = message.payload;
        
        // Add to batch
        this.pendingReceipts.push({ logId, vendorId, status });

        // Process batch if it's full
        if (this.pendingReceipts.length >= this.batchSize) {
          await this.processBatch();
        } else {
          // Set timer for batch processing
          if (this.batchTimer) {
            clearTimeout(this.batchTimer);
          }
          
          this.batchTimer = setTimeout(async () => {
            await this.processBatch();
          }, this.batchTimeout);
        }

        await MessageQueueService.markMessageCompleted(message.id);
        logger.info('Receipt message queued for batch processing:', { messageId: message.id });
      } catch (error) {
        logger.error('Failed to process receipt message:', { messageId: message.id, error });
        await MessageQueueService.markMessageFailed(message.id, error.message);
      }
    } catch (error) {
      logger.error('Error processing receipt messages:', error);
    }
  }

  private static async processBatch(): Promise<void> {
    if (this.pendingReceipts.length === 0) {
      return;
    }

    const receipts = [...this.pendingReceipts];
    this.pendingReceipts = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await DeliveryService.processReceiptBatch(receipts);
      logger.info('Batch receipts processed successfully:', { count: receipts.length });
    } catch (error) {
      logger.error('Failed to process batch receipts:', error);
      
      // Retry individual receipts
      for (const receipt of receipts) {
        try {
          await DeliveryService.processReceipt(receipt.logId, receipt.vendorId, receipt.status);
        } catch (retryError) {
          logger.error('Failed to process individual receipt:', { receipt, error: retryError });
        }
      }
    }
  }

  static async getStatus(): Promise<{ running: boolean; processed: number; failed: number; pendingBatch: number }> {
    try {
      const stats = await MessageQueueService.getQueueStats('receipt_process');
      
      return {
        running: this.isRunning,
        processed: stats.completed,
        failed: stats.failed,
        pendingBatch: this.pendingReceipts.length,
      };
    } catch (error) {
      logger.error('Failed to get receipt processor status:', error);
      return {
        running: this.isRunning,
        processed: 0,
        failed: 0,
        pendingBatch: 0,
      };
    }
  }
}
