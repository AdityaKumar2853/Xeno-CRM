const { PrismaClient } = require('@prisma/client');

// Test database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS@yamanote.proxy.rlwy.net:23968/railway'
    }
  }
});

async function testConnection() {
  try {
    console.log('🔍 Testing Railway database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test user query
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);
    
    // Test customer query
    const customerCount = await prisma.customer.count();
    console.log(`👤 Found ${customerCount} customers in database`);
    
    // Test order query
    const orderCount = await prisma.order.count();
    console.log(`📦 Found ${orderCount} orders in database`);
    
    console.log('🎉 Database connection test successful!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('📡 Database connection closed');
  }
}

testConnection();

