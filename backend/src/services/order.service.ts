import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';
import { MessageQueueService } from './messageQueue.service';

export interface CreateOrderData {
  customerId: string;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  orderDate?: Date;
}

export interface UpdateOrderData {
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
}

export interface OrderFilters {
  customerId?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  orderDateAfter?: Date;
  orderDateBefore?: Date;
}

export class OrderService {
  static async createOrder(data: CreateOrderData): Promise<any> {
    try {
      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        throw errors.NOT_FOUND('Customer not found');
      }

      // Check if order number already exists
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: data.orderNumber },
      });

      if (existingOrder) {
        throw errors.CONFLICT('Order with this number already exists');
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          customerId: data.customerId,
          orderNumber: data.orderNumber,
          totalAmount: data.totalAmount,
          status: data.status,
          orderDate: data.orderDate || new Date(),
        },
      });

      // Update customer stats
      await this.updateCustomerStats(data.customerId);

      logger.info('Order created successfully:', { orderId: order.id, orderNumber: order.orderNumber });

      return order;
    } catch (error) {
      logger.error('Failed to create order:', error as Error);
      throw error;
    }
  }

  static async createOrderAsync(data: CreateOrderData): Promise<void> {
    try {
      await MessageQueueService.addToQueue('order_ingest', {
        type: 'create',
        data,
        timestamp: new Date().toISOString(),
      });

      logger.info('Order creation queued:', { orderNumber: data.orderNumber });
    } catch (error) {
      logger.error('Failed to queue order creation:', error as Error);
      throw error;
    }
  }

  static async getOrderById(id: string): Promise<any> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!order) {
        throw errors.NOT_FOUND('Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Failed to get order by ID:', error as Error);
      throw error;
    }
  }

  static async getOrders(
    options: {
      page: number;
      limit: number;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ): Promise<{ orders: any[]; total: number; page: number; limit: number }> {
    const { page, limit, search, sortBy, sortOrder } = options;
    const filters: OrderFilters = {};
    try {
      const where: any = {};

      // Apply search filter
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Apply filters
      if (filters.customerId) {
        where.customerId = filters.customerId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        where.totalAmount = {};
        if (filters.minAmount !== undefined) {
          where.totalAmount.gte = filters.minAmount;
        }
        if (filters.maxAmount !== undefined) {
          where.totalAmount.lte = filters.maxAmount;
        }
      }

      if (filters.orderDateAfter || filters.orderDateBefore) {
        where.orderDate = {};
        if (filters.orderDateAfter) {
          where.orderDate.gte = filters.orderDateAfter;
        }
        if (filters.orderDateBefore) {
          where.orderDate.lte = filters.orderDateBefore;
        }
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
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
        prisma.order.count({ where }),
      ]);

      return {
        orders,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get orders:', error as Error);
      throw error;
    }
  }

  static async updateOrder(id: string, data: UpdateOrderData): Promise<any> {
    try {
      const order = await prisma.order.update({
        where: { id },
        data,
      });

      // Update customer stats if status changed
      if (data.status) {
        await this.updateCustomerStats(order.customerId);
      }

      logger.info('Order updated successfully:', { orderId: id });

      return order;
    } catch (error) {
      if (error.code === 'P2025') {
        throw errors.NOT_FOUND('Order not found');
      }
      logger.error('Failed to update order:', error);
      throw error;
    }
  }

  static async deleteOrder(id: string): Promise<void> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        select: { customerId: true },
      });

      if (!order) {
        throw errors.NOT_FOUND('Order not found');
      }

      await prisma.order.delete({
        where: { id },
      });

      // Update customer stats
      await this.updateCustomerStats(order.customerId);

      logger.info('Order deleted successfully:', { orderId: id });
    } catch (error) {
      if (error.code === 'P2025') {
        throw errors.NOT_FOUND('Order not found');
      }
      logger.error('Failed to delete order:', error);
      throw error;
    }
  }

  static async getOrderStats(): Promise<any> {
    try {
      const [
        totalOrders,
        totalRevenue,
        avgOrderValue,
        ordersByStatus,
        recentOrders,
        monthlyRevenue,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          _avg: { totalAmount: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          _count: { id: true },
          _sum: { totalAmount: true },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { orderDate: 'desc' },
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.order.groupBy({
          by: ['orderDate'],
          _sum: { totalAmount: true },
          _count: { id: true },
          orderBy: { orderDate: 'desc' },
          take: 12,
        }),
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        avgOrderValue: avgOrderValue._avg.totalAmount || 0,
        ordersByStatus,
        recentOrders,
        monthlyRevenue,
      };
    } catch (error) {
      logger.error('Failed to get order stats:', error as Error);
      throw error;
    }
  }

  static async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { orderDate: 'desc' },
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

  private static async updateCustomerStats(customerId: string): Promise<void> {
    try {
      const [totalSpent, totalOrders, lastOrder] = await Promise.all([
        prisma.order.aggregate({
          where: { 
            customerId,
            status: 'completed',
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.count({
          where: { 
            customerId,
            status: 'completed',
          },
        }),
        prisma.order.findFirst({
          where: { 
            customerId,
            status: 'completed',
          },
          orderBy: { orderDate: 'desc' },
          select: { orderDate: true },
        }),
      ]);

      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: totalSpent._sum.totalAmount || 0,
          totalOrders,
          lastOrderAt: lastOrder?.orderDate || null,
        },
      });
    } catch (error) {
      logger.error('Failed to update customer stats:', error as Error);
    }
  }
}
