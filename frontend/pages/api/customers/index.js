import { dataStore } from '../../../lib/dataStore';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const customers = dataStore.getCustomers();
      res.status(200).json({
        success: true,
        data: customers
      });
    } else if (req.method === 'POST') {
      const { name, email, phone } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and email are required' }
        });
      }

      const newCustomer = dataStore.createCustomer({ name, email, phone });
      res.status(201).json({
        success: true,
        data: newCustomer
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      const updatedCustomer = dataStore.updateCustomer(id, updateData);
      
      if (updatedCustomer) {
        res.status(200).json({
          success: true,
          data: updatedCustomer
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Customer not found' }
        });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const deletedCustomer = dataStore.deleteCustomer(id);
      
      if (deletedCustomer) {
        res.status(200).json({
          success: true,
          data: deletedCustomer
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Customer not found' }
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
