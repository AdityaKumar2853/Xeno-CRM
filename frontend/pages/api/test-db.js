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
  console.log('🧪 Test DB API called:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });

  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test raw query to see actual data
    console.log('🔍 Testing raw query...');
    const rawCustomers = await prisma.$queryRaw`SELECT * FROM customers LIMIT 5`;
    console.log('📊 Raw customers query result:', rawCustomers);

    // Test Prisma query
    console.log('🔍 Testing Prisma query...');
    const prismaCustomers = await prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    console.log('📊 Prisma customers query result:', prismaCustomers);

    // Test count
    const customerCount = await prisma.customer.count();
    console.log('📊 Customer count:', customerCount);

    res.status(200).json({
      success: true,
      data: {
        connected: true,
        rawCustomers,
        prismaCustomers,
        customerCount,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Test DB error:', {
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
    });
  } finally {
    await prisma.$disconnect();
  }
}
