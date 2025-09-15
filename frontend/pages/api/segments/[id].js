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
      error: { message: 'Segment ID is required' },
    });
  }

  try {
    if (req.method === 'GET') {
      const segment = await prisma.segment.findUnique({
        where: { id },
      });

      if (!segment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Segment not found' },
        });
      }

      res.status(200).json({
        success: true,
        data: segment,
      });
    } else if (req.method === 'PUT') {
      const { name, description, rules } = req.body;
      
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

      const segment = await prisma.segment.update({
        where: { id },
        data: {
          name,
          description: description || '',
          rules: parsedRules,
        },
      });

      res.status(200).json({
        success: true,
        data: segment,
        message: 'Segment updated successfully',
      });
    } else if (req.method === 'DELETE') {
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
    console.error('❌ Segment API error:', {
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
