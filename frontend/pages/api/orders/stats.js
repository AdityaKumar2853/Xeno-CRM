import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Try to connect to database first
      try {
        await prisma.$connect();
        
        const [
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
        ] = await Promise.all([
          prisma.order.count(),
          prisma.order.aggregate({
            _sum: { amount: true },
          }),
          prisma.order.count({
            where: { status: 'pending' },
          }),
          prisma.order.count({
            where: { status: 'completed' },
          }),
        ]);

        const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.amount || 0) / totalOrders : 0;

        res.status(200).json({
          success: true,
          data: {
            totalOrders,
            totalRevenue: totalRevenue._sum.amount || 0,
            pendingOrders,
            completedOrders,
            averageOrderValue,
          },
        });
      } catch (dbError) {
        console.log('Database not ready for orders stats, returning zero data:', dbError.message);
        // Return zero data if database is not ready
        res.status(200).json({
          success: true,
          data: {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0,
            averageOrderValue: 0,
          },
        });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  } finally {
    await prisma.$disconnect();
  }
}