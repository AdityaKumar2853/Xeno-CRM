import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export default async function handler(req, res) {
  try {
    await prisma.$connect();
    
    // Test the exact query from customer stats
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    
    // Also get individual orders to see the data
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        totalAmount: true,
        status: true
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalRevenueQuery: totalRevenue,
        totalRevenueValue: totalRevenue._sum.totalAmount,
        orders: orders,
        ordersCount: orders.length
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}
