import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Try to connect to database first
      try {
        await prisma.$connect();
        
        const [
          totalCustomers,
          totalOrders,
          totalRevenue,
          recentCustomers,
        ] = await Promise.all([
          prisma.customer.count(),
          prisma.order.count(),
          prisma.order.aggregate({
            _sum: { totalAmount: true },
          }),
          prisma.customer.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
          }),
        ]);

        res.status(200).json({
          success: true,
          data: {
            totalCustomers,
            totalOrders,
            totalRevenue: totalRevenue._sum.amount || 0,
            recentCustomers,
          },
        });
      } catch (dbError) {
        // Return zero data if database is not ready
        res.status(200).json({
          success: true,
          data: {
            totalCustomers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            recentCustomers: [],
          },
        });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  } finally {
    await prisma.$disconnect();
  }
}