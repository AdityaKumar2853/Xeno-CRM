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
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
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
      const { name, description, rules, userId } = req.body;
      
      if (!name || !rules) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and rules are required' },
        });
      }

      // Parse rules if it's a string
      let parsedRules = rules;
      if (typeof rules === 'string') {
        try {
          parsedRules = JSON.parse(rules);
        } catch (e) {
          console.error('Failed to parse rules:', e);
          return res.status(400).json({
            success: false,
            error: { message: 'Invalid rules format' },
          });
        }
      }

      // Use a default user ID if not provided (for testing)
      const defaultUserId = userId || 'cmfktszbb0000cwjufaxnklgf'; // Test user ID from database

      const segment = await prisma.segment.create({
        data: {
          name,
          description: description || '',
          rules: parsedRules,
          userId: defaultUserId,
        },
      });

      res.status(201).json({
        success: true,
        data: segment,
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Segment ID is required' },
        });
      }

      const segment = await prisma.segment.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        data: segment,
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Segment ID is required' },
        });
      }
      
      await prisma.segment.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Segment deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Segment API error:', error.message);
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