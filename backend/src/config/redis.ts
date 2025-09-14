import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisConfig = {
  host: process.env['REDIS_HOST'] || 'localhost',
  port: parseInt(process.env['REDIS_PORT'] || '6379'),
  password: process.env['REDIS_PASSWORD'] || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Don't exit process for Redis connection failure
    // The app can still work without Redis for some features
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.disconnect();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};

// Redis utility functions
export const redisUtils = {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  async incr(key: string): Promise<number> {
    return await redis.incr(key);
  },

  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  },

  async keys(pattern: string): Promise<string[]> {
    return await redis.keys(pattern);
  },

  async flushall(): Promise<void> {
    await redis.flushall();
  }
};
