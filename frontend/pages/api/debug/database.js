import { PrismaClient } from '@prisma/client';

// Create Prisma client with Railway database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://root:QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS@yamanote.proxy.rlwy.net:23968/railway'
    }
  }
});

export default async function handler(req, res) {
  console.log('🔍 Database debug API called:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  });

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test basic query
    console.log('🔍 Testing basic query...');
    const userCount = await prisma.user.count();
    console.log('👥 User count:', userCount);

    const customerCount = await prisma.customer.count();
    console.log('👤 Customer count:', customerCount);

    const orderCount = await prisma.order.count();
    console.log('📦 Order count:', orderCount);

    // Get database info
    console.log('📊 Getting database info...');
    const dbInfo = await prisma.$queryRaw`SELECT VERSION() as version, DATABASE() as database_name`;
    console.log('🗄️ Database info:', dbInfo);

    // Test table existence
    console.log('🔍 Checking table existence...');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    console.log('📋 Available tables:', tables);

    res.status(200).json({
      success: true,
      data: {
        connected: true,
        userCount,
        customerCount,
        orderCount,
        databaseInfo: dbInfo,
        tables: tables,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Database debug error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
      },
      data: {
        connected: false,
        timestamp: new Date().toISOString(),
      },
    });
  } finally {
    await prisma.$disconnect();
    console.log('📡 Database connection closed');
  }
}
