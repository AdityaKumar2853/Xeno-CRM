import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';
import { redisUtils } from '../config/redis';
import { MessageQueueService } from './messageQueue.service';

export interface CreateCustomerData {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  lastOrderAfter?: Date;
  lastOrderBefore?: Date;
}

export class CustomerService {
  static async createCustomer(data: CreateCustomerData): Promise<any> {
    try {
      // Check if customer already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (existingCustomer) {
        throw errors.CONFLICT('Customer with this email already exists');
      }

      // Create customer
      const customer = await prisma.customer.create({
        data: {
          email: data.email,
          name: data.name || null,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          postalCode: data.postalCode || null,
        },
      });

      logger.info('Customer created successfully:', { customerId: customer.id, email: customer.email });

      return customer;
    } catch (error) {
      logger.error('Failed to create customer:', error as Error);
      throw error;
    }
  }

  static async createCustomerAsync(data: CreateCustomerData): Promise<void> {
    try {
      await MessageQueueService.addToQueue('customer_ingest', {
        type: 'create',
        data,
        timestamp: new Date().toISOString(),
      });

      logger.info('Customer creation queued:', { email: data.email });
    } catch (error) {
      logger.error('Failed to queue customer creation:', error as Error);
      throw error;
    }
  }

  static async getCustomerById(id: string): Promise<any> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              orderDate: true,
            },
            orderBy: {
              orderDate: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!customer) {
        throw errors.NOT_FOUND('Customer not found');
      }

      return customer;
    } catch (error) {
      logger.error('Failed to get customer by ID:', error as Error);
      throw error;
    }
  }

  static async getCustomers(
    options: {
      page: number;
      limit: number;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ): Promise<{ customers: any[]; total: number; page: number; limit: number }> {
    const { page, limit, search, sortBy, sortOrder } = options;
    const filters: CustomerFilters = { search };
    try {
      const where: any = {};

      // Apply filters
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } },
        ];
      }

      if (filters.city) {
        where.city = { contains: filters.city };
      }

      if (filters.state) {
        where.state = { contains: filters.state };
      }

      if (filters.country) {
        where.country = { contains: filters.country };
      }

      if (filters.minSpent !== undefined || filters.maxSpent !== undefined) {
        where.totalSpent = {};
        if (filters.minSpent !== undefined) {
          where.totalSpent.gte = filters.minSpent;
        }
        if (filters.maxSpent !== undefined) {
          where.totalSpent.lte = filters.maxSpent;
        }
      }

      if (filters.minOrders !== undefined || filters.maxOrders !== undefined) {
        where.totalOrders = {};
        if (filters.minOrders !== undefined) {
          where.totalOrders.gte = filters.minOrders;
        }
        if (filters.maxOrders !== undefined) {
          where.totalOrders.lte = filters.maxOrders;
        }
      }

      if (filters.lastOrderAfter || filters.lastOrderBefore) {
        where.lastOrderAt = {};
        if (filters.lastOrderAfter) {
          where.lastOrderAt.gte = filters.lastOrderAfter;
        }
        if (filters.lastOrderBefore) {
          where.lastOrderAt.lte = filters.lastOrderBefore;
        }
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            city: true,
            state: true,
            country: true,
            totalSpent: true,
            totalOrders: true,
            lastOrderAt: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.customer.count({ where }),
      ]);

      return {
        customers,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get customers:', error as Error);
      throw error;
    }
  }

  static async updateCustomer(id: string, data: UpdateCustomerData): Promise<any> {
    try {
      const customer = await prisma.customer.update({
        where: { id },
        data,
      });

      logger.info('Customer updated successfully:', { customerId: id });

      return customer;
    } catch (error) {
      if (error.code === 'P2025') {
        throw errors.NOT_FOUND('Customer not found');
      }
      logger.error('Failed to update customer:', error);
      throw error;
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    try {
      await prisma.customer.delete({
        where: { id },
      });

      logger.info('Customer deleted successfully:', { customerId: id });
    } catch (error) {
      if (error.code === 'P2025') {
        throw errors.NOT_FOUND('Customer not found');
      }
      logger.error('Failed to delete customer:', error);
      throw error;
    }
  }

  static async getCustomerStats(): Promise<any> {
    try {
      const [
        totalCustomers,
        totalSpent,
        avgOrderValue,
        customersByCity,
        customersByCountry,
        recentCustomers,
      ] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.aggregate({
          _sum: { totalSpent: true },
        }).catch(() => ({ _sum: { totalSpent: null } })),
        prisma.customer.aggregate({
          _avg: { totalSpent: true },
        }).catch(() => ({ _avg: { totalSpent: null } })),
        prisma.customer.groupBy({
          by: ['city'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }).catch(() => []),
        prisma.customer.groupBy({
          by: ['country'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }).catch(() => []),
        prisma.customer.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            totalSpent: true,
            createdAt: true,
          },
        }).catch(() => []),
      ]);

      const stats = {
        totalCustomers,
        totalSpent: totalSpent._sum.totalSpent || 0,
        avgOrderValue: avgOrderValue._avg.totalSpent || 0,
        customersByCity,
        customersByCountry,
        recentCustomers,
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get customer stats:', error as Error);
      throw error;
    }
  }

  static async searchCustomers(query: string, limit: number = 10): Promise<any[]> {
    try {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          totalSpent: true,
          totalOrders: true,
        },
      });

      return customers;
    } catch (error) {
      logger.error('Failed to search customers:', error as Error);
      throw error;
    }
  }

  static async getCustomerOrders(
    customerId: string,
    options: { page: number; limit: number }
  ): Promise<{ orders: any[]; total: number; page: number; limit: number }> {
    try {
      const { page, limit } = options;
      
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { orderDate: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            orderDate: true,
            createdAt: true,
          },
        }),
        prisma.order.count({ where: { customerId } }),
      ]);

      return {
        orders,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get customer orders:', error as Error);
      throw error;
    }
  }
}
