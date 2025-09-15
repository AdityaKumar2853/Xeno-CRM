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
          { rules: { contains: search, mode: 'insensitive' } },
        ],
      } : {};

      const [segments, total] = await Promise.all([
        prisma.segment.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.segment.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: segments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } else if (req.method === 'POST') {
      const { name, rules } = req.body;
      
      if (!name || !rules) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and rules are required' },
        });
      }

      // Calculate customer count based on rules (simplified)
      const customerCount = await prisma.customer.count();

      const segment = await prisma.segment.create({
        data: {
          name,
          rules,
          customerCount,
        },
      });

      res.status(201).json({
        success: true,
        data: segment,
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      const segment = await prisma.segment.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        data: segment,
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await prisma.segment.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        success: true,
        message: 'Segment deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Segment API error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  } finally {
    await prisma.$disconnect();
  }
}