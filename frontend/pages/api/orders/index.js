import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = search ? {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
        ],
      } : {};

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } else if (req.method === 'POST') {
      const { customerId, amount, items, status = 'pending' } = req.body;
      
      if (!customerId || !amount) {
        return res.status(400).json({
          success: false,
          error: { message: 'Customer ID and amount are required' },
        });
      }

      const order = await prisma.order.create({
        data: {
          customerId: parseInt(customerId),
          amount: parseFloat(amount),
          items: items || [],
          status,
        },
        include: { customer: true },
      });

      // Update customer total spend
      await prisma.customer.update({
        where: { id: parseInt(customerId) },
        data: {
          totalSpend: {
            increment: parseFloat(amount),
          },
        },
      });

      res.status(201).json({
        success: true,
        data: order,
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      const order = await prisma.order.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { customer: true },
      });

      res.status(200).json({
        success: true,
        data: order,
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await prisma.order.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Order API error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  } finally {
    await prisma.$disconnect();
  }
}