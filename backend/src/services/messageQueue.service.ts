import { prisma } from '../config/database';
import { redisUtils } from '../config/redis';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface QueueMessage {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageQueueService {
  private static readonly QUEUE_PREFIX = 'queue:';
  private static readonly PROCESSING_PREFIX = 'processing:';
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 5000; // 5 seconds

  static async addToQueue(type: string, payload: any, priority: number = 0): Promise<string> {
    try {
      const messageId = uuidv4();
      const message = {
        id: messageId,
        type,
        payload,
        status: 'pending',
        attempts: 0,
        maxAttempts: this.MAX_RETRY_ATTEMPTS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in database
      await prisma.messageQueue.create({
        data: {
          id: messageId,
          type,
          payload,
          status: 'pending',
          attempts: 0,
          maxAttempts: this.MAX_RETRY_ATTEMPTS,
        },
      });

      // Add to Redis queue
      const queueKey = `${this.QUEUE_PREFIX}${type}`;
      await redisUtils.set(`${queueKey}:${messageId}`, message);

      // Add to priority queue
      await redisUtils.set(`priority:${type}:${messageId}`, priority);

      logger.info('Message added to queue:', { messageId, type, priority });

      return messageId;
    } catch (error) {
      logger.error('Failed to add message to queue:', error);
      throw error;
    }
  }

  static async getNextMessage(type: string): Promise<QueueMessage | null> {
    try {
      const queueKey = `${this.QUEUE_PREFIX}${type}`;
      const keys = await redisUtils.keys(`${queueKey}:*`);

      if (keys.length === 0) {
        return null;
      }

      // Get message with highest priority
      let selectedMessage: QueueMessage | null = null;
      let highestPriority = -1;

      for (const key of keys) {
        const message = await redisUtils.get<QueueMessage>(key);
        if (!message) continue;

        const messageId = key.split(':').pop();
        const priority = await redisUtils.get<number>(`priority:${type}:${messageId}`) || 0;

        if (priority > highestPriority) {
          highestPriority = priority;
          selectedMessage = message;
        }
      }

      if (selectedMessage) {
        // Move to processing queue
        const processingKey = `${this.PROCESSING_PREFIX}${type}:${selectedMessage.id}`;
        await redisUtils.set(processingKey, selectedMessage, 300); // 5 minutes TTL

        // Update status in database
        await prisma.messageQueue.update({
          where: { id: selectedMessage.id },
          data: {
            status: 'processing',
            updatedAt: new Date(),
          },
        });

        // Remove from main queue
        await redisUtils.del(`${queueKey}:${selectedMessage.id}`);
        await redisUtils.del(`priority:${type}:${selectedMessage.id}`);
      }

      return selectedMessage;
    } catch (error) {
      logger.error('Failed to get next message from queue:', error);
      return null;
    }
  }

  static async markMessageCompleted(messageId: string): Promise<void> {
    try {
      // Update database
      await prisma.messageQueue.update({
        where: { id: messageId },
        data: {
          status: 'completed',
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Remove from processing queue
      const processingKeys = await redisUtils.keys(`${this.PROCESSING_PREFIX}*:${messageId}`);
      for (const key of processingKeys) {
        await redisUtils.del(key);
      }

      logger.info('Message marked as completed:', { messageId });
    } catch (error) {
      logger.error('Failed to mark message as completed:', error);
      throw error;
    }
  }

  static async markMessageFailed(messageId: string, error: string): Promise<void> {
    try {
      // Get current message
      const message = await prisma.messageQueue.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        logger.error('Message not found for failure marking:', { messageId });
        return;
      }

      const newAttempts = message.attempts + 1;

      if (newAttempts >= message.maxAttempts) {
        // Max attempts reached, mark as failed
        await prisma.messageQueue.update({
          where: { id: messageId },
          data: {
            status: 'failed',
            attempts: newAttempts,
            error,
            updatedAt: new Date(),
          },
        });

        // Remove from processing queue
        const processingKeys = await redisUtils.keys(`${this.PROCESSING_PREFIX}*:${messageId}`);
        for (const key of processingKeys) {
          await redisUtils.del(key);
        }

        logger.error('Message failed permanently:', { messageId, error, attempts: newAttempts });
      } else {
        // Retry the message
        await prisma.messageQueue.update({
          where: { id: messageId },
          data: {
            status: 'pending',
            attempts: newAttempts,
            error,
            updatedAt: new Date(),
          },
        });

        // Add back to queue with delay
        setTimeout(async () => {
          try {
            const queueKey = `${this.QUEUE_PREFIX}${message.type}`;
            await redisUtils.set(`${queueKey}:${messageId}`, {
              ...message,
              status: 'pending',
              attempts: newAttempts,
              error,
              updatedAt: new Date(),
            });
          } catch (retryError) {
            logger.error('Failed to retry message:', { messageId, error: retryError });
          }
        }, this.RETRY_DELAY);

        logger.warn('Message will be retried:', { messageId, error, attempts: newAttempts });
      }
    } catch (error) {
      logger.error('Failed to mark message as failed:', error);
      throw error;
    }
  }

  static async getQueueStats(type?: string): Promise<any> {
    try {
      const where = type ? { type } : {};
      
      const [
        total,
        pending,
        processing,
        completed,
        failed,
      ] = await Promise.all([
        prisma.messageQueue.count({ where }),
        prisma.messageQueue.count({ where: { ...where, status: 'pending' } }),
        prisma.messageQueue.count({ where: { ...where, status: 'processing' } }),
        prisma.messageQueue.count({ where: { ...where, status: 'completed' } }),
        prisma.messageQueue.count({ where: { ...where, status: 'failed' } }),
      ]);

      return {
        total,
        pending,
        processing,
        completed,
        failed,
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  static async clearCompletedMessages(olderThanHours: number = 24): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

      const result = await prisma.messageQueue.deleteMany({
        where: {
          status: 'completed',
          processedAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info('Cleared completed messages:', { count: result.count, olderThanHours });
      return result.count;
    } catch (error) {
      logger.error('Failed to clear completed messages:', error);
      throw error;
    }
  }

  static async getFailedMessages(type?: string, limit: number = 100): Promise<QueueMessage[]> {
    try {
      const where = type ? { type, status: 'failed' } : { status: 'failed' };
      
      const messages = await prisma.messageQueue.findMany({
        where,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });

      return messages as QueueMessage[];
    } catch (error) {
      logger.error('Failed to get failed messages:', error);
      throw error;
    }
  }

  static async retryFailedMessage(messageId: string): Promise<void> {
    try {
      const message = await prisma.messageQueue.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.status !== 'failed') {
        throw new Error('Message is not in failed status');
      }

      // Reset message for retry
      await prisma.messageQueue.update({
        where: { id: messageId },
        data: {
          status: 'pending',
          attempts: 0,
          error: null,
          updatedAt: new Date(),
        },
      });

      // Add back to queue
      const queueKey = `${this.QUEUE_PREFIX}${message.type}`;
      await redisUtils.set(`${queueKey}:${messageId}`, {
        ...message,
        status: 'pending',
        attempts: 0,
        error: null,
        updatedAt: new Date(),
      });

      logger.info('Failed message queued for retry:', { messageId });
    } catch (error) {
      logger.error('Failed to retry failed message:', error);
      throw error;
    }
  }
}
