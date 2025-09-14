import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';
import { MessageQueueService } from './messageQueue.service';
import { redisUtils } from '../config/redis';

export interface CreateCampaignData {
  name: string;
  description?: string;
  message: string;
  segmentId: string;
  userId: string;
  scheduledAt?: Date;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  message?: string;
  status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  scheduledAt?: Date;
}

export interface CampaignStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  failureRate: number;
  audienceSize: number;
}

export class CampaignService {
  static async createCampaign(data: CreateCampaignData): Promise<any> {
    try {
      // Verify segment belongs to user
      const segment = await prisma.segment.findFirst({
        where: { 
          id: data.segmentId,
          userId: data.userId,
        },
      });

      if (!segment) {
        throw errors.NOT_FOUND('Segment not found');
      }

      // Create campaign
      const campaign = await prisma.campaign.create({
        data: {
          name: data.name,
          description: data.description,
          message: data.message,
          segmentId: data.segmentId,
          userId: data.userId,
          status: data.scheduledAt ? 'scheduled' : 'draft',
          scheduledAt: data.scheduledAt,
        },
      });

      logger.info('Campaign created successfully:', { campaignId: campaign.id, userId: data.userId });

      return campaign;
    } catch (error) {
      logger.error('Failed to create campaign:', error);
      throw error;
    }
  }

  static async getCampaignById(id: string, userId: string): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
        include: {
          segment: {
            select: {
              id: true,
              name: true,
              description: true,
              _count: {
                select: { customers: true },
              },
            },
          },
          communicationLogs: {
            select: {
              id: true,
              status: true,
              sentAt: true,
              deliveredAt: true,
              failedAt: true,
              failureReason: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { communicationLogs: true },
          },
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      return campaign;
    } catch (error) {
      logger.error('Failed to get campaign by ID:', error);
      throw error;
    }
  }

  static async getCampaigns(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<{ campaigns: any[]; total: number; page: number; limit: number }> {
    try {
      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            segment: {
              select: {
                id: true,
                name: true,
                _count: {
                  select: { customers: true },
                },
              },
            },
            _count: {
              select: { communicationLogs: true },
            },
          },
        }),
        prisma.campaign.count({ where }),
      ]);

      return {
        campaigns,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get campaigns:', error);
      throw error;
    }
  }

  static async updateCampaign(id: string, userId: string, data: UpdateCampaignData): Promise<any> {
    try {
      const campaign = await prisma.campaign.updateMany({
        where: { 
          id,
          userId,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      if (campaign.count === 0) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      logger.info('Campaign updated successfully:', { campaignId: id, userId });

      return await this.getCampaignById(id, userId);
    } catch (error) {
      logger.error('Failed to update campaign:', error);
      throw error;
    }
  }

  static async deleteCampaign(id: string, userId: string): Promise<void> {
    try {
      const result = await prisma.campaign.deleteMany({
        where: { 
          id,
          userId,
        },
      });

      if (result.count === 0) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      logger.info('Campaign deleted successfully:', { campaignId: id, userId });
    } catch (error) {
      logger.error('Failed to delete campaign:', error);
      throw error;
    }
  }

  static async startCampaign(id: string, userId: string): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
        include: {
          segment: {
            include: {
              customers: {
                include: {
                  customer: true,
                },
              },
            },
          },
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw errors.BAD_REQUEST('Campaign can only be started from draft or scheduled status');
      }

      // Update campaign status
      await prisma.campaign.update({
        where: { id },
        data: {
          status: 'running',
          startedAt: new Date(),
        },
      });

      // Queue campaign processing
      await MessageQueueService.addToQueue('campaign_process', {
        campaignId: id,
        userId,
        segmentId: campaign.segmentId,
        message: campaign.message,
        customerIds: campaign.segment.customers.map(sc => sc.customer.id),
      });

      logger.info('Campaign started successfully:', { campaignId: id, userId });

      return await this.getCampaignById(id, userId);
    } catch (error) {
      logger.error('Failed to start campaign:', error);
      throw error;
    }
  }

  static async pauseCampaign(id: string, userId: string): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      if (campaign.status !== 'running') {
        throw errors.BAD_REQUEST('Only running campaigns can be paused');
      }

      await prisma.campaign.update({
        where: { id },
        data: {
          status: 'paused',
        },
      });

      logger.info('Campaign paused successfully:', { campaignId: id, userId });

      return await this.getCampaignById(id, userId);
    } catch (error) {
      logger.error('Failed to pause campaign:', error);
      throw error;
    }
  }

  static async resumeCampaign(id: string, userId: string): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      if (campaign.status !== 'paused') {
        throw errors.BAD_REQUEST('Only paused campaigns can be resumed');
      }

      await prisma.campaign.update({
        where: { id },
        data: {
          status: 'running',
        },
      });

      logger.info('Campaign resumed successfully:', { campaignId: id, userId });

      return await this.getCampaignById(id, userId);
    } catch (error) {
      logger.error('Failed to resume campaign:', error);
      throw error;
    }
  }

  static async cancelCampaign(id: string, userId: string): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      if (campaign.status === 'completed') {
        throw errors.BAD_REQUEST('Completed campaigns cannot be cancelled');
      }

      await prisma.campaign.update({
        where: { id },
        data: {
          status: 'cancelled',
        },
      });

      logger.info('Campaign cancelled successfully:', { campaignId: id, userId });

      return await this.getCampaignById(id, userId);
    } catch (error) {
      logger.error('Failed to cancel campaign:', error);
      throw error;
    }
  }

  static async getCampaignStats(id: string, userId: string): Promise<CampaignStats> {
    try {
      // Verify campaign belongs to user
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      const [
        totalSent,
        totalDelivered,
        totalFailed,
        audienceSize,
      ] = await Promise.all([
        prisma.communicationLog.count({
          where: { campaignId: id },
        }),
        prisma.communicationLog.count({
          where: { 
            campaignId: id,
            status: 'delivered',
          },
        }),
        prisma.communicationLog.count({
          where: { 
            campaignId: id,
            status: 'failed',
          },
        }),
        prisma.segmentCustomer.count({
          where: { segmentId: campaign.segmentId },
        }),
      ]);

      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate,
        failureRate,
        audienceSize,
      };
    } catch (error) {
      logger.error('Failed to get campaign stats:', error);
      throw error;
    }
  }

  static async getCampaignLogs(
    id: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ logs: any[]; total: number; page: number; limit: number }> {
    try {
      // Verify campaign belongs to user
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      const where: any = { campaignId: id };
      if (status) {
        where.status = status;
      }

      const [logs, total] = await Promise.all([
        prisma.communicationLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.communicationLog.count({ where }),
      ]);

      return {
        logs,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get campaign logs:', error);
      throw error;
    }
  }

  static async getCampaignInsights(id: string, userId: string): Promise<any> {
    try {
      // Verify campaign belongs to user
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      const cacheKey = `campaign_insights:${id}`;
      const cachedInsights = await redisUtils.get(cacheKey);

      if (cachedInsights) {
        return cachedInsights;
      }

      const [
        stats,
        logsByStatus,
        logsByHour,
        topCities,
        topCountries,
      ] = await Promise.all([
        this.getCampaignStats(id, userId),
        prisma.communicationLog.groupBy({
          by: ['status'],
          where: { campaignId: id },
          _count: { id: true },
        }),
        prisma.communicationLog.groupBy({
          by: ['sentAt'],
          where: { 
            campaignId: id,
            sentAt: { not: null },
          },
          _count: { id: true },
        }),
        prisma.communicationLog.groupBy({
          by: ['customer'],
          where: { campaignId: id },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        prisma.communicationLog.groupBy({
          by: ['customer'],
          where: { campaignId: id },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
      ]);

      const insights = {
        stats,
        logsByStatus,
        logsByHour,
        topCities,
        topCountries,
        generatedAt: new Date().toISOString(),
      };

      // Cache for 5 minutes
      await redisUtils.set(cacheKey, insights, 300);

      return insights;
    } catch (error) {
      logger.error('Failed to get campaign insights:', error);
      throw error;
    }
  }

  static async scheduleCampaign(id: string, userId: string, scheduledAt: Date): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId,
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      if (campaign.status !== 'draft') {
        throw errors.BAD_REQUEST('Only draft campaigns can be scheduled');
      }

      if (scheduledAt <= new Date()) {
        throw errors.BAD_REQUEST('Scheduled time must be in the future');
      }

      await prisma.campaign.update({
        where: { id },
        data: {
          status: 'scheduled',
          scheduledAt,
        },
      });

      logger.info('Campaign scheduled successfully:', { campaignId: id, scheduledAt, userId });

      return await this.getCampaignById(id, userId);
    } catch (error) {
      logger.error('Failed to schedule campaign:', error);
      throw error;
    }
  }
}
