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
      error: { message: 'Campaign ID is required' },
    });
  }

  try {
    if (req.method === 'GET') {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          segment: true,
        },
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: { message: 'Campaign not found' },
        });
      }

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } else if (req.method === 'PUT') {
      const { name, description, message, segmentId, status } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and message are required' },
        });
      }

      // Use a default user ID if not provided
      const defaultUserId = 'cmfktszbb0000cwjufaxnklgf'; // Test user ID from database

      const campaign = await prisma.campaign.update({
        where: { id },
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

      res.status(200).json({
        success: true,
        data: campaign,
        message: 'Campaign updated successfully',
      });
    } else if (req.method === 'DELETE') {
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
