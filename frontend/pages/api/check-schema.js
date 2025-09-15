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
  console.log('🔍 Schema check API called');

  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check customers table structure
    const customerColumns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'customers'
      ORDER BY ORDINAL_POSITION
    `;
    console.log('📊 Customer table columns:', customerColumns);

    // Check orders table structure
    const orderColumns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `;
    console.log('📊 Order table columns:', orderColumns);

    // Check segments table structure
    const segmentColumns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'segments'
      ORDER BY ORDINAL_POSITION
    `;
    console.log('📊 Segment table columns:', segmentColumns);

    // Check campaigns table structure
    const campaignColumns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'campaigns'
      ORDER BY ORDINAL_POSITION
    `;
    console.log('📊 Campaign table columns:', campaignColumns);

    res.status(200).json({
      success: true,
      data: {
        customerColumns,
        orderColumns,
        segmentColumns,
        campaignColumns,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Schema check error:', error);
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
