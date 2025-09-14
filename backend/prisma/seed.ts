import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@minicrm.com' },
    update: {},
    create: {
      email: 'admin@minicrm.com',
      name: 'Admin User',
      googleId: 'google_123456789',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'manager@minicrm.com' },
    update: {},
    create: {
      email: 'manager@minicrm.com',
      name: 'Manager User',
      googleId: 'google_987654321',
    },
  });

  console.log('✅ Users created:', { user1: user1.email, user2: user2.email });

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        totalSpent: 2500.00,
        totalOrders: 5,
        lastOrderAt: new Date('2024-01-10'),
      },
    }),
    prisma.customer.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        phone: '+1234567891',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90210',
        totalSpent: 1800.00,
        totalOrders: 3,
        lastOrderAt: new Date('2024-01-05'),
      },
    }),
    prisma.customer.upsert({
      where: { email: 'mike.johnson@example.com' },
      update: {},
      create: {
        email: 'mike.johnson@example.com',
        name: 'Mike Johnson',
        phone: '+1234567892',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601',
        totalSpent: 3200.00,
        totalOrders: 7,
        lastOrderAt: new Date('2024-01-12'),
      },
    }),
    prisma.customer.upsert({
      where: { email: 'sarah.wilson@example.com' },
      update: {},
      create: {
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson',
        phone: '+1234567893',
        address: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        postalCode: '33101',
        totalSpent: 950.00,
        totalOrders: 2,
        lastOrderAt: new Date('2023-12-20'),
      },
    }),
    prisma.customer.upsert({
      where: { email: 'david.brown@example.com' },
      update: {},
      create: {
        email: 'david.brown@example.com',
        name: 'David Brown',
        phone: '+1234567894',
        address: '654 Maple Ave',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        postalCode: '98101',
        totalSpent: 4200.00,
        totalOrders: 9,
        lastOrderAt: new Date('2024-01-15'),
      },
    }),
  ]);

  console.log('✅ Customers created:', customers.length);

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        customerId: customers[0].id,
        orderNumber: 'ORD-001',
        totalAmount: 299.99,
        status: 'completed',
        orderDate: new Date('2024-01-10'),
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[0].id,
        orderNumber: 'ORD-002',
        totalAmount: 199.99,
        status: 'completed',
        orderDate: new Date('2024-01-05'),
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[1].id,
        orderNumber: 'ORD-003',
        totalAmount: 599.99,
        status: 'completed',
        orderDate: new Date('2024-01-05'),
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[2].id,
        orderNumber: 'ORD-004',
        totalAmount: 399.99,
        status: 'completed',
        orderDate: new Date('2024-01-12'),
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[3].id,
        orderNumber: 'ORD-005',
        totalAmount: 149.99,
        status: 'completed',
        orderDate: new Date('2023-12-20'),
      },
    }),
  ]);

  console.log('✅ Orders created:', orders.length);

  // Create sample segments
  const segment1 = await prisma.segment.create({
    data: {
      name: 'High Value Customers',
      description: 'Customers who have spent more than ₹10,000',
      rules: {
        field: 'totalSpent',
        operator: 'gt',
        value: 10000,
      },
      userId: user1.id,
    },
  });

  const segment2 = await prisma.segment.create({
    data: {
      name: 'Recent Customers',
      description: 'Customers who ordered in the last 30 days',
      rules: {
        field: 'lastOrderAt',
        operator: 'gte',
        value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      userId: user1.id,
    },
  });

  const segment3 = await prisma.segment.create({
    data: {
      name: 'Inactive Customers',
      description: 'Customers who haven\'t ordered in 90+ days',
      rules: {
        field: 'lastOrderAt',
        operator: 'lt',
        value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      userId: user1.id,
    },
  });

  console.log('✅ Segments created:', 3);

  // Add customers to segments
  await prisma.segmentCustomer.createMany({
    data: [
      { segmentId: segment1.id, customerId: customers[0].id },
      { segmentId: segment1.id, customerId: customers[2].id },
      { segmentId: segment1.id, customerId: customers[4].id },
      { segmentId: segment2.id, customerId: customers[0].id },
      { segmentId: segment2.id, customerId: customers[1].id },
      { segmentId: segment2.id, customerId: customers[2].id },
      { segmentId: segment2.id, customerId: customers[4].id },
      { segmentId: segment3.id, customerId: customers[3].id },
    ],
  });

  console.log('✅ Segment customers created');

  // Create sample campaigns
  await prisma.campaign.create({
    data: {
      name: 'Welcome Back Campaign',
      description: 'Re-engage inactive customers with special offers',
      message: 'Hi {{name}}, we miss you! Here\'s 15% off your next order. Use code WELCOME15',
      segmentId: segment3.id,
      userId: user1.id,
      status: 'draft',
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'High Value Customer Appreciation',
      description: 'Thank high-value customers for their loyalty',
      message: 'Dear {{name}}, thank you for being a valued customer! Enjoy 20% off your next purchase.',
      segmentId: segment1.id,
      userId: user1.id,
      status: 'completed',
      startedAt: new Date('2024-01-01'),
      completedAt: new Date('2024-01-02'),
    },
  });

  console.log('✅ Campaigns created:', 2);

  // Create sample communication logs
  const communicationLogs = await Promise.all([
    prisma.communicationLog.create({
      data: {
        campaignId: campaign2.id,
        customerId: customers[0].id,
        userId: user1.id,
        message: 'Dear John Doe, thank you for being a valued customer! Enjoy 20% off your next purchase.',
        status: 'delivered',
        vendorId: 'vendor_123',
        sentAt: new Date('2024-01-01T10:00:00Z'),
        deliveredAt: new Date('2024-01-01T10:05:00Z'),
      },
    }),
    prisma.communicationLog.create({
      data: {
        campaignId: campaign2.id,
        customerId: customers[2].id,
        userId: user1.id,
        message: 'Dear Mike Johnson, thank you for being a valued customer! Enjoy 20% off your next purchase.',
        status: 'delivered',
        vendorId: 'vendor_124',
        sentAt: new Date('2024-01-01T10:01:00Z'),
        deliveredAt: new Date('2024-01-01T10:06:00Z'),
      },
    }),
    prisma.communicationLog.create({
      data: {
        campaignId: campaign2.id,
        customerId: customers[4].id,
        userId: user1.id,
        message: 'Dear David Brown, thank you for being a valued customer! Enjoy 20% off your next purchase.',
        status: 'failed',
        vendorId: 'vendor_125',
        sentAt: new Date('2024-01-01T10:02:00Z'),
        failedAt: new Date('2024-01-01T10:03:00Z'),
        failureReason: 'Invalid email address',
      },
    }),
  ]);

  console.log('✅ Communication logs created:', communicationLogs.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
