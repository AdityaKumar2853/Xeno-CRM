import { Request, Response } from 'express';
import { OrderService } from '../../services/order.service';
import { logger } from '../../utils/logger';

export class OrderController {
  // Get all orders with pagination and filters
  static async getOrders(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const orders = await OrderService.getOrders({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      logger.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch orders',
          code: 'ORDERS_FETCH_ERROR',
        },
      });
    }
  }

  // Get order by ID
  static async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Order not found',
            code: 'ORDER_NOT_FOUND',
          },
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      logger.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch order',
          code: 'ORDER_FETCH_ERROR',
        },
      });
    }
  }

  // Create new order
  static async createOrder(req: Request, res: Response) {
    try {
      const orderData = req.body;
      const order = await OrderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create order',
          code: 'ORDER_CREATE_ERROR',
        },
      });
    }
  }

  // Update order
  static async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const order = await OrderService.updateOrder(id, updateData);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Order not found',
            code: 'ORDER_NOT_FOUND',
          },
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      logger.error('Error updating order:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update order',
          code: 'ORDER_UPDATE_ERROR',
        },
      });
    }
  }

  // Delete order
  static async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await OrderService.deleteOrder(id);

      res.json({
        success: true,
        data: { message: 'Order deleted successfully' },
      });
    } catch (error) {
      logger.error('Error deleting order:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete order',
          code: 'ORDER_DELETE_ERROR',
        },
      });
    }
  }

  // Get order statistics
  static async getOrderStats(req: Request, res: Response) {
    try {
      const stats = await OrderService.getOrderStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching order stats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch order statistics',
          code: 'ORDER_STATS_ERROR',
        },
      });
    }
  }
}
