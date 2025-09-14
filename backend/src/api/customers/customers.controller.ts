import { Request, Response } from 'express';
import { CustomerService } from '../../services/customer.service';
import { logger } from '../../utils/logger';

export class CustomerController {
  // Get all customers with pagination and filters
  static async getCustomers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const customers = await CustomerService.getCustomers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      logger.error('Error fetching customers:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch customers',
          code: 'CUSTOMERS_FETCH_ERROR',
        },
      });
    }
  }

  // Get customer by ID
  static async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Customer not found',
            code: 'CUSTOMER_NOT_FOUND',
          },
        });
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error fetching customer:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch customer',
          code: 'CUSTOMER_FETCH_ERROR',
        },
      });
    }
  }

  // Create new customer
  static async createCustomer(req: Request, res: Response) {
    try {
      const customerData = req.body;
      const customer = await CustomerService.createCustomer(customerData);

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create customer',
          code: 'CUSTOMER_CREATE_ERROR',
        },
      });
    }
  }

  // Update customer
  static async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const customer = await CustomerService.updateCustomer(id, updateData);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Customer not found',
            code: 'CUSTOMER_NOT_FOUND',
          },
        });
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update customer',
          code: 'CUSTOMER_UPDATE_ERROR',
        },
      });
    }
  }

  // Delete customer
  static async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CustomerService.deleteCustomer(id);

      res.json({
        success: true,
        data: { message: 'Customer deleted successfully' },
      });
    } catch (error) {
      logger.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete customer',
          code: 'CUSTOMER_DELETE_ERROR',
        },
      });
    }
  }

  // Get customer statistics
  static async getCustomerStats(req: Request, res: Response) {
    try {
      const stats = await CustomerService.getCustomerStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching customer stats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch customer statistics',
          code: 'CUSTOMER_STATS_ERROR',
        },
      });
    }
  }

  // Search customers
  static async searchCustomers(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const customers = await CustomerService.searchCustomers(query as string);
      
      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      logger.error('Error searching customers:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to search customers',
          code: 'CUSTOMER_SEARCH_ERROR',
        },
      });
    }
  }

  // Get customer orders
  static async getCustomerOrders(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const orders = await CustomerService.getCustomerOrders(id, {
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      logger.error('Error fetching customer orders:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch customer orders',
          code: 'CUSTOMER_ORDERS_ERROR',
        },
      });
    }
  }
}
