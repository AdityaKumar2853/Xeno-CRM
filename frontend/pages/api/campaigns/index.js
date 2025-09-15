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
      // Try to connect to database first
      try {
        await prisma.$connect();
        
        const { page = 1, limit = 10, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const where = search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ],
        } : {};

        const [campaigns, total] = await Promise.all([
          prisma.campaign.findMany({
            where,
            skip,
            take: parseInt(limit),
            include: { segment: true },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.campaign.count({ where }),
        ]);

        res.status(200).json({
          success: true,
          data: campaigns,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        });
      } catch (dbError) {
        console.log('Database not ready for campaigns, returning empty data:', dbError.message);
        // Return empty data if database is not ready
        res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          },
        });
      }
    } else if (req.method === 'POST') {
      const { name, description, message, segmentId, status = 'draft', userId } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and message are required' },
        });
      }

      // Use a default user ID if not provided
      const defaultUserId = userId || 'cmfktszbb0000cwjufaxnklgf'; // Test user ID from database

      const campaign = await prisma.campaign.create({
        data: {
          name,
          description: description || '',
          message,
          segmentId: segmentId || null,
          userId: defaultUserId,
          status,
        },
        include: { segment: true },
      });

      res.status(201).json({
        success: true,
        data: campaign,
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Campaign ID is required' },
        });
      }
      
      const campaign = await prisma.campaign.update({
        where: { id },
        data: updateData,
        include: { segment: true },
      });

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Campaign ID is required' },
        });
      }
      
      await prisma.campaign.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Campaign API error:', {
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