const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Create some sample data
    console.log('📝 Creating sample data...');
    
    // Create sample customers
    const customer1 = await prisma.customer.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        totalSpend: 1200.50,
      },
    });
    
    const customer2 = await prisma.customer.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90210',
        totalSpend: 850.75,
      },
    });
    
    console.log('✅ Sample customers created');
    
    // Create sample orders
    await prisma.order.create({
      data: {
        customerId: customer1.id,
        amount: 1200.50,
        items: ['Product A', 'Product B'],
        status: 'completed',
      },
    });
    
    await prisma.order.create({
      data: {
        customerId: customer2.id,
        amount: 850.75,
        items: ['Product C'],
        status: 'pending',
      },
    });
    
    console.log('✅ Sample orders created');
    
    // Create sample segments
    await prisma.segment.create({
      data: {
        name: 'High Value Customers',
        rules: 'total_spend > 1000',
        customerCount: 1,
      },
    });
    
    await prisma.segment.create({
      data: {
        name: 'New Customers',
        rules: 'created_at > today - 30',
        customerCount: 2,
      },
    });
    
    console.log('✅ Sample segments created');
    
    // Create sample campaigns
    await prisma.campaign.create({
      data: {
        name: 'Welcome Campaign',
        message: 'Welcome to our platform! Enjoy 10% off your first order.',
        status: 'draft',
        sentCount: 0,
        openRate: 0,
      },
    });
    
    console.log('✅ Sample campaigns created');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
