import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './api/auth/auth.routes';
import ingestRoutes from './api/ingest/ingest.routes';
import segmentsRoutes from './api/segments/segments.routes';
import campaignsRoutes from './api/campaigns/campaigns.routes';
import deliveryRoutes from './api/delivery/delivery.routes';
import aiRoutes from './api/ai/ai.routes';

// Import workers
import { IngestConsumer } from './workers/ingest-consumer';
import { CampaignProcessor } from './workers/campaign-processor';
import { DeliveryWorker } from './workers/delivery-worker';
import { ReceiptProcessor } from './workers/receipt-processor';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Rate limiting
app.use(rateLimit(config.rateLimit));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop workers
    await Promise.all([
      IngestConsumer.stop(),
      CampaignProcessor.stop(),
      DeliveryWorker.stop(),
      ReceiptProcessor.stop(),
    ]);

    // Close database connections
    await Promise.all([
      disconnectDatabase(),
      disconnectRedis(),
    ]);

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();

    // Start workers
    await Promise.all([
      IngestConsumer.start(),
      CampaignProcessor.start(),
      DeliveryWorker.start(),
      ReceiptProcessor.start(),
    ]);

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
