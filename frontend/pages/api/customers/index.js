import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {};

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.customer.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } else if (req.method === 'POST') {
      const { name, email, phone, address, city, state, country, postalCode } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and email are required' },
        });
      }

      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          address,
          city,
          state,
          country,
          postalCode,
          totalSpend: 0,
        },
      });

      res.status(201).json({
        success: true,
        data: customer,
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      const customer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        data: customer,
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await prisma.customer.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Customer API error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  } finally {
    await prisma.$disconnect();
  }
}