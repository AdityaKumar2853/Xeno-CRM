import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { asyncHandler } from '../../utils/errorHandler';
import { validate } from '../../utils/validation';
import { schemas } from '../../utils/validation';
import { logger } from '../../utils/logger';

export class IngestController {
  // Customer ingestion endpoints
  static createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await CustomerService.createCustomer(req.body);

    res.status(201).json({
      success: true,
      data: { customer },
      message: 'Customer created successfully',
    });
  });

  static createCustomerAsync = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.createCustomerAsync(req.body);

    res.status(202).json({
      success: true,
      message: 'Customer creation queued successfully',
    });
  });

  static createCustomersBatch = asyncHandler(async (req: Request, res: Response) => {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Customers array is required and must not be empty' },
      });
    }

    if (customers.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum 1000 customers allowed per batch' },
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      try {
        const customer = await CustomerService.createCustomer(customers[i]);
        results.push({ index: i, customer, status: 'success' });
      } catch (error) {
        errors.push({ 
          index: i, 
          error: error.message, 
          data: customers[i],
          status: 'failed' 
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        total: customers.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
      message: 'Batch processing completed',
    });
  });

  static createCustomersBatchAsync = asyncHandler(async (req: Request, res: Response) => {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Customers array is required and must not be empty' },
      });
    }

    if (customers.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum 1000 customers allowed per batch' },
      });
    }

    const queuedCustomers = [];

    for (const customer of customers) {
      try {
        await CustomerService.createCustomerAsync(customer);
        queuedCustomers.push({ customer, status: 'queued' });
      } catch (error) {
        logger.error('Failed to queue customer:', { error: error.message, customer });
      }
    }

    res.status(202).json({
      success: true,
      data: {
        total: customers.length,
        queued: queuedCustomers.length,
        failed: customers.length - queuedCustomers.length,
      },
      message: 'Batch queued successfully',
    });
  });

  // Order ingestion endpoints
  static createOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order created successfully',
    });
  });

  static createOrderAsync = asyncHandler(async (req: Request, res: Response) => {
    await OrderService.createOrderAsync(req.body);

    res.status(202).json({
      success: true,
      message: 'Order creation queued successfully',
    });
  });

  static createOrdersBatch = asyncHandler(async (req: Request, res: Response) => {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Orders array is required and must not be empty' },
      });
    }

    if (orders.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum 1000 orders allowed per batch' },
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < orders.length; i++) {
      try {
        const order = await OrderService.createOrder(orders[i]);
        results.push({ index: i, order, status: 'success' });
      } catch (error) {
        errors.push({ 
          index: i, 
          error: error.message, 
          data: orders[i],
          status: 'failed' 
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        total: orders.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
      message: 'Batch processing completed',
    });
  });

  static createOrdersBatchAsync = asyncHandler(async (req: Request, res: Response) => {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Orders array is required and must not be empty' },
      });
    }

    if (orders.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum 1000 orders allowed per batch' },
      });
    }

    const queuedOrders = [];

    for (const order of orders) {
      try {
        await OrderService.createOrderAsync(order);
        queuedOrders.push({ order, status: 'queued' });
      } catch (error) {
        logger.error('Failed to queue order:', { error: error.message, order });
      }
    }

    res.status(202).json({
      success: true,
      data: {
        total: orders.length,
        queued: queuedOrders.length,
        failed: orders.length - queuedOrders.length,
      },
      message: 'Batch queued successfully',
    });
  });

  // Health check for ingestion services
  static healthCheck = asyncHandler(async (req: Request, res: Response) => {
    const { MessageQueueService } = await import('../../services/messageQueue.service');
    
    const queueStats = await MessageQueueService.getQueueStats();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        queueStats,
      },
    });
  });

  // Get ingestion statistics
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const { MessageQueueService } = await import('../../services/messageQueue.service');
    
    const [customerStats, orderStats, queueStats] = await Promise.all([
      CustomerService.getCustomerStats(),
      OrderService.getOrderStats(),
      MessageQueueService.getQueueStats(),
    ]);

    res.json({
      success: true,
      data: {
        customers: customerStats,
        orders: orderStats,
        queue: queueStats,
      },
    });
  });
}
