import { dataStore } from '../../../lib/dataStore';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const orders = dataStore.getOrders();
      res.status(200).json({
        success: true,
        data: orders
      });
    } else if (req.method === 'POST') {
      const { customerId, amount, items } = req.body;
      
      if (!customerId || !amount) {
        return res.status(400).json({
          success: false,
          error: { message: 'Customer ID and amount are required' }
        });
      }

      const newOrder = dataStore.createOrder({ customerId, amount, items });
      res.status(201).json({
        success: true,
        data: newOrder
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      const updatedOrder = dataStore.updateOrder(id, updateData);
      
      if (updatedOrder) {
        res.status(200).json({
          success: true,
          data: updatedOrder
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Order not found' }
        });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const deletedOrder = dataStore.deleteOrder(id);
      
      if (deletedOrder) {
        res.status(200).json({
          success: true,
          data: deletedOrder
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Order not found' }
        });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
}
