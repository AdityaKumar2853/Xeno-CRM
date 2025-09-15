import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';
import { SQLBuilder, RuleGroup, RuleCondition } from '../utils/sqlBuilder';

export interface CreateSegmentData {
  name: string;
  description?: string;
  rules: RuleGroup | RuleCondition;
  userId: string;
}

export interface UpdateSegmentData {
  name?: string;
  description?: string;
  rules?: RuleGroup | RuleCondition;
}

export interface SegmentPreview {
  totalCustomers: number;
  sampleCustomers: any[];
  estimatedSize: number;
}

export class SegmentService {
  static async createSegment(data: CreateSegmentData): Promise<any> {
    try {
      // Validate rules
      if (!SQLBuilder.validateRule(data.rules)) {
        throw errors.VALIDATION_ERROR('Invalid segment rules');
      }

      // Create segment
      const segment = await prisma.segment.create({
        data: {
          name: data.name,
          description: data.description || null,
          rules: data.rules as any,
          userId: data.userId,
        },
      });

      logger.info('Segment created successfully:', { segmentId: segment.id, userId: data.userId });

      return segment;
    } catch (error) {
      logger.error('Failed to create segment:', error as Error);
      throw error;
    }
  }

  static async getSegmentById(id: string, userId: string): Promise<any> {
    try {
      const segment = await prisma.segment.findFirst({
        where: { 
          id,
          userId,
        },
        include: {
          customers: {
            select: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  totalSpent: true,
                  totalOrders: true,
                  lastOrderAt: true,
                },
              },
            },
            take: 10,
          },
        },
      });

      if (!segment) {
        throw errors.NOT_FOUND('Segment not found');
      }

      return segment;
    } catch (error) {
      logger.error('Failed to get segment by ID:', error as Error);
      throw error;
    }
  }

  static async getSegments(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ segments: any[]; total: number; page: number; limit: number }> {
    try {
      const where: any = { userId };

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const [segments, total] = await Promise.all([
        prisma.segment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { customers: true },
            },
          },
        }),
        prisma.segment.count({ where }),
      ]);

      return {
        segments,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get segments:', error as Error);
      throw error;
    }
  }

  static async updateSegment(id: string, userId: string, data: UpdateSegmentData): Promise<any> {
    try {
      // Validate rules if provided
      if (data.rules && !SQLBuilder.validateRule(data.rules)) {
        throw errors.VALIDATION_ERROR('Invalid segment rules');
      }

      const segment = await prisma.segment.updateMany({
        where: { 
          id,
          userId,
        },
        data: {
          ...data,
          rules: data.rules as any,
        },
      });

      if (segment.count === 0) {
        throw errors.NOT_FOUND('Segment not found');
      }

      // If rules were updated, clear the segment customers
      if (data.rules) {
        await prisma.segmentCustomer.deleteMany({
          where: { segmentId: id },
        });
      }

      logger.info('Segment updated successfully:', { segmentId: id, userId });

      return await this.getSegmentById(id, userId);
    } catch (error) {
      logger.error('Failed to update segment:', error as Error);
      throw error;
    }
  }

  static async deleteSegment(id: string, userId: string): Promise<void> {
    try {
      const result = await prisma.segment.deleteMany({
        where: { 
          id,
          userId,
        },
      });

      if (result.count === 0) {
        throw errors.NOT_FOUND('Segment not found');
      }

      logger.info('Segment deleted successfully:', { segmentId: id, userId });
    } catch (error) {
      logger.error('Failed to delete segment:', error as Error);
      throw error;
    }
  }

  static async previewSegment(rules: RuleGroup | RuleCondition): Promise<SegmentPreview> {
    try {
      // Validate rules
      if (!SQLBuilder.validateRule(rules)) {
        throw errors.VALIDATION_ERROR('Invalid segment rules');
      }

      const whereClause = SQLBuilder.buildWhereClause(rules);

      // Get total count
      const totalCustomers = await prisma.customer.count({
        where: whereClause,
      });

      // Get sample customers
      const sampleCustomers = await prisma.customer.findMany({
        where: whereClause,
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          totalSpent: true,
          totalOrders: true,
          lastOrderAt: true,
          city: true,
          state: true,
          country: true,
        },
      });

      // Estimate size based on total count
      const estimatedSize = totalCustomers;

      return {
        totalCustomers,
        sampleCustomers,
        estimatedSize,
      };
    } catch (error) {
      logger.error('Failed to preview segment:', error as Error);
      throw error;
    }
  }

  static async buildSegment(segmentId: string, userId: string): Promise<{ customersAdded: number; customersRemoved: number }> {
    try {
      const segment = await prisma.segment.findFirst({
        where: { 
          id: segmentId,
          userId,
        },
      });

      if (!segment) {
        throw errors.NOT_FOUND('Segment not found');
      }

      // Get customers matching the rules
      const whereClause = SQLBuilder.buildWhereClause(segment.rules as unknown as RuleGroup | RuleCondition);
      const matchingCustomers = await prisma.customer.findMany({
        where: whereClause,
        select: { id: true },
      });

      const matchingCustomerIds = matchingCustomers.map(c => c.id);

      // Get current segment customers
      const currentSegmentCustomers = await prisma.segmentCustomer.findMany({
        where: { segmentId },
        select: { customerId: true },
      });

      const currentCustomerIds = currentSegmentCustomers.map(sc => sc.customerId);

      // Find customers to add and remove
      const customersToAdd = matchingCustomerIds.filter(id => !currentCustomerIds.includes(id));
      const customersToRemove = currentCustomerIds.filter(id => !matchingCustomerIds.includes(id));

      // Remove customers that no longer match
      if (customersToRemove.length > 0) {
        await prisma.segmentCustomer.deleteMany({
          where: {
            segmentId,
            customerId: { in: customersToRemove },
          },
        });
      }

      // Add new customers
      if (customersToAdd.length > 0) {
        await prisma.segmentCustomer.createMany({
          data: customersToAdd.map(customerId => ({
            segmentId,
            customerId,
          })),
        });
      }

      logger.info('Segment built successfully:', { 
        segmentId, 
        customersAdded: customersToAdd.length, 
        customersRemoved: customersToRemove.length 
      });

      return {
        customersAdded: customersToAdd.length,
        customersRemoved: customersToRemove.length,
      };
    } catch (error) {
      logger.error('Failed to build segment:', error as Error);
      throw error;
    }
  }

  static async getSegmentCustomers(
    segmentId: string,
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ customers: any[]; total: number; page: number; limit: number }> {
    try {
      // Verify segment belongs to user
      const segment = await prisma.segment.findFirst({
        where: { 
          id: segmentId,
          userId,
        },
      });

      if (!segment) {
        throw errors.NOT_FOUND('Segment not found');
      }

      const [customers, total] = await Promise.all([
        prisma.segmentCustomer.findMany({
          where: { segmentId },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                totalSpent: true,
                totalOrders: true,
                lastOrderAt: true,
                city: true,
                state: true,
                country: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.segmentCustomer.count({ where: { segmentId } }),
      ]);

      return {
        customers: customers.map(sc => sc.customer),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get segment customers:', error as Error);
      throw error;
    }
  }

  static async getSegmentStats(segmentId: string, userId: string): Promise<any> {
    try {
      // Verify segment belongs to user
      const segment = await prisma.segment.findFirst({
        where: { 
          id: segmentId,
          userId,
        },
      });

      if (!segment) {
        throw errors.NOT_FOUND('Segment not found');
      }

      const [
        totalCustomers,
        avgSpent,
        totalSpent,
        recentCustomers,
      ] = await Promise.all([
        prisma.segmentCustomer.count({ where: { segmentId } }),
        prisma.segmentCustomer.aggregate({
          where: { segmentId },
          _avg: { customerId: true },
        } as any),
        prisma.segmentCustomer.aggregate({
          where: { segmentId },
          _sum: { customerId: true },
        } as any),
        prisma.segmentCustomer.groupBy({
          by: ['customerId'],
          where: { segmentId },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        prisma.segmentCustomer.groupBy({
          by: ['customerId'],
          where: { segmentId },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        prisma.segmentCustomer.findMany({
          where: { segmentId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                totalSpent: true,
                totalOrders: true,
              },
            },
          },
        }),
      ]);

      return {
        totalCustomers,
        avgSpent: (avgSpent as any)._avg?.customerId || 0,
        totalSpent: (totalSpent as any)._sum?.customerId || 0,
        recentCustomers: recentCustomers.map(sc => sc.customerId),
      };
    } catch (error) {
      logger.error('Failed to get segment stats:', error as Error);
      throw error;
    }
  }

  static async validateRules(rules: RuleGroup | RuleCondition): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      if (!SQLBuilder.validateRule(rules)) {
        errors.push('Invalid rule structure');
        return { valid: false, errors };
      }

      // Additional validation can be added here
      // For example, checking if field names are valid, operators are supported, etc.

      return { valid: true, errors: [] };
    } catch (error) {
      logger.error('Failed to validate rules:', error as Error);
      return { valid: false, errors: [(error as Error).message] };
    }
  }

  static async getRuleFields(): Promise<{ field: string; type: string; operators: string[] }[]> {
    try {
      const fields = [
        'email', 'name', 'phone', 'city', 'state', 'country', 'postalCode',
        'totalSpent', 'totalOrders', 'lastOrderAt', 'createdAt'
      ];

      return fields.map(field => ({
        field,
        type: SQLBuilder.getFieldType(field),
        operators: SQLBuilder.getOperatorsForField(field),
      }));
    } catch (error) {
      logger.error('Failed to get rule fields:', error as Error);
      throw error;
    }
  }
}
