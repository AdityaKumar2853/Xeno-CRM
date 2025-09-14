import { MessageQueueService } from '../services/messageQueue.service';
import { CustomerService } from '../services/customer.service';
import { OrderService } from '../services/order.service';
import { logger } from '../utils/logger';

export class IngestConsumer {
  private static isRunning = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  static async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Ingest consumer is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting ingest consumer...');

    // Process messages every 5 seconds
    this.processingInterval = setInterval(async () => {
      await this.processMessages();
    }, 5000);

    // Process messages immediately
    await this.processMessages();
  }

  static async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Ingest consumer is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    logger.info('Ingest consumer stopped');
  }

  private static async processMessages(): Promise<void> {
    try {
      // Process customer ingestion
      await this.processCustomerIngest();
      
      // Process order ingestion
      await this.processOrderIngest();
    } catch (error) {
      logger.error('Error processing ingest messages:', error as Error);
    }
  }

  private static async processCustomerIngest(): Promise<void> {
    try {
      const message = await MessageQueueService.getNextMessage('customer_ingest');
      
      if (!message) {
        return;
      }

      logger.info('Processing customer ingest message:', { messageId: message.id });

      try {
        const { type, data } = message.payload;
        
        if (type === 'create') {
          await CustomerService.createCustomer(data);
        } else if (type === 'update') {
          await CustomerService.updateCustomer(data.id, data);
        } else if (type === 'delete') {
          await CustomerService.deleteCustomer(data.id);
        }

        await MessageQueueService.markMessageCompleted(message.id);
        logger.info('Customer ingest message processed successfully:', { messageId: message.id });
      } catch (error) {
        logger.error('Failed to process customer ingest message:', { messageId: message.id, error: error as Error });
        await MessageQueueService.markMessageFailed(message.id, (error as Error).message);
      }
    } catch (error) {
      logger.error('Error processing customer ingest:', error as Error);
    }
  }

  private static async processOrderIngest(): Promise<void> {
    try {
      const message = await MessageQueueService.getNextMessage('order_ingest');
      
      if (!message) {
        return;
      }

      logger.info('Processing order ingest message:', { messageId: message.id });

      try {
        const { type, data } = message.payload;
        
        if (type === 'create') {
          await OrderService.createOrder(data);
        } else if (type === 'update') {
          await OrderService.updateOrder(data.id, data);
        } else if (type === 'delete') {
          await OrderService.deleteOrder(data.id);
        }

        await MessageQueueService.markMessageCompleted(message.id);
        logger.info('Order ingest message processed successfully:', { messageId: message.id });
      } catch (error) {
        logger.error('Failed to process order ingest message:', { messageId: message.id, error: error as Error });
        await MessageQueueService.markMessageFailed(message.id, (error as Error).message);
      }
    } catch (error) {
      logger.error('Error processing order ingest:', error as Error);
    }
  }

  static async getStatus(): Promise<{ running: boolean; processed: number; failed: number }> {
    try {
      const stats = await MessageQueueService.getQueueStats('customer_ingest');
      const orderStats = await MessageQueueService.getQueueStats('order_ingest');
      
      return {
        running: this.isRunning,
        processed: stats.completed + orderStats.completed,
        failed: stats.failed + orderStats.failed,
      };
    } catch (error) {
      logger.error('Failed to get ingest consumer status:', error as Error);
      return {
        running: this.isRunning,
        processed: 0,
        failed: 0,
      };
    }
  }
}
