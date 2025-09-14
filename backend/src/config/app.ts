import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.API_PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/mini_crm',
  },
  
  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  
  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  
  // External APIs
  apis: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    vendorApiUrl: process.env.VENDOR_API_URL || 'http://localhost:3002',
  },
  
  // AI Configuration
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },
  
  // Message Broker Configuration
  messageBroker: {
    kafka: {
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      clientId: 'mini-crm-backend',
    },
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    },
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  
  // Security Configuration
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutes
  },
  
  // Campaign Configuration
  campaign: {
    maxSegmentSize: 100000, // Maximum customers per segment
    batchSize: 1000, // Batch size for processing
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
  },
  
  // Vendor API Configuration
  vendor: {
    successRate: 0.9, // 90% success rate
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}
