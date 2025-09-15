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
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Order ID is required' },
    });
  }

  try {
    if (req.method === 'GET') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: { message: 'Order not found' },
        });
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } else if (req.method === 'PUT') {
      const { customerId, orderNumber, totalAmount, status } = req.body;
      
      if (!customerId || !totalAmount) {
        return res.status(400).json({
          success: false,
          error: { message: 'Customer ID and total amount are required' },
        });
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          customerId,
          orderNumber,
          totalAmount: parseFloat(totalAmount),
          status,
        },
        include: { customer: true },
      });

      res.status(200).json({
        success: true,
        data: order,
        message: 'Order updated successfully',
      });
    } else if (req.method === 'DELETE') {
      await prisma.order.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Order API error:', error.message);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Internal server error: ' + error.message,
        code: error.code,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
