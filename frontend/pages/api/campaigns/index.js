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
    } else if (req.method === 'POST') {
      const { name, segmentId, message, status = 'draft' } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and message are required' },
        });
      }

      const campaign = await prisma.campaign.create({
        data: {
          name,
          segmentId: segmentId ? parseInt(segmentId) : null,
          message,
          status,
          sentCount: 0,
          openRate: 0,
        },
        include: { segment: true },
      });

      res.status(201).json({
        success: true,
        data: campaign,
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      const campaign = await prisma.campaign.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { segment: true },
      });

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await prisma.campaign.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully',
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Campaign API error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  } finally {
    await prisma.$disconnect();
  }
}