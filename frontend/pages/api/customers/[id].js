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
      error: { message: 'Customer ID is required' },
    });
  }

  try {
    if (req.method === 'GET') {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: { message: 'Customer not found' },
        });
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } else if (req.method === 'PUT') {
      const { name, email, phone, address, city, state, country, postalCode } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and email are required' },
        });
      }

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          address,
          city,
          state,
          country,
          postalCode,
        },
      });

      res.status(200).json({
        success: true,
        data: customer,
        message: 'Customer updated successfully',
      });
    } else if (req.method === 'DELETE') {
      await prisma.customer.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Customer API error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
    });
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
