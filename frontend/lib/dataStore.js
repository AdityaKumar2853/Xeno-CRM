// In-memory data store for the CRM
class DataStore {
  constructor() {
    this.customers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', totalSpend: 1200, createdAt: '2024-01-15', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=ffffff&size=150' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', totalSpend: 800, createdAt: '2024-01-14', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=ffffff&size=150' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', totalSpend: 1500, createdAt: '2024-01-13', avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=8b5cf6&color=ffffff&size=150' }
    ];
    
    this.orders = [
      { id: 1, customerId: 1, customerName: 'John Doe', amount: 1200, status: 'completed', date: '2024-01-15', items: ['Product A', 'Product B'] },
      { id: 2, customerId: 2, customerName: 'Jane Smith', amount: 800, status: 'pending', date: '2024-01-14', items: ['Product C'] },
      { id: 3, customerId: 3, customerName: 'Bob Johnson', amount: 1500, status: 'completed', date: '2024-01-13', items: ['Product D', 'Product E'] }
    ];
    
    this.campaigns = [
      { id: 1, name: 'Welcome Campaign', status: 'active', segmentId: 1, message: 'Welcome to our platform!', createdAt: '2024-01-10', sentCount: 150, openRate: 0.75 },
      { id: 2, name: 'Retention Campaign', status: 'draft', segmentId: 2, message: 'We miss you! Come back with 20% off.', createdAt: '2024-01-12', sentCount: 0, openRate: 0 }
    ];
    
    this.segments = [
      { id: 1, name: 'High Value Customers', rules: 'total_spend > 1000', customerCount: 2, createdAt: '2024-01-10' },
      { id: 2, name: 'Inactive Customers', rules: 'last_purchase_date < today - 90', customerCount: 1, createdAt: '2024-01-12' }
    ];
  }

  // Customer methods
  getCustomers() {
    return this.customers;
  }

  getCustomerById(id) {
    return this.customers.find(c => c.id === parseInt(id));
  }

  createCustomer(customerData) {
    const newCustomer = {
      id: Date.now(),
      ...customerData,
      totalSpend: 0,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerData.name || 'Customer')}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=ffffff&size=150`
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  updateCustomer(id, customerData) {
    const index = this.customers.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...customerData };
      return this.customers[index];
    }
    return null;
  }

  deleteCustomer(id) {
    const index = this.customers.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      return this.customers.splice(index, 1)[0];
    }
    return null;
  }

  // Order methods
  getOrders() {
    return this.orders;
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === parseInt(id));
  }

  createOrder(orderData) {
    const customer = this.getCustomerById(orderData.customerId);
    const newOrder = {
      id: Date.now(),
      ...orderData,
      customerName: customer ? customer.name : 'Unknown Customer',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      items: orderData.items || []
    };
    this.orders.push(newOrder);
    
    // Update customer total spend
    if (customer) {
      customer.totalSpend += orderData.amount || 0;
    }
    
    return newOrder;
  }

  updateOrder(id, orderData) {
    const index = this.orders.findIndex(o => o.id === parseInt(id));
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...orderData };
      return this.orders[index];
    }
    return null;
  }

  deleteOrder(id) {
    const index = this.orders.findIndex(o => o.id === parseInt(id));
    if (index !== -1) {
      return this.orders.splice(index, 1)[0];
    }
    return null;
  }

  // Campaign methods
  getCampaigns() {
    return this.campaigns;
  }

  getCampaignById(id) {
    return this.campaigns.find(c => c.id === parseInt(id));
  }

  createCampaign(campaignData) {
    const newCampaign = {
      id: Date.now(),
      ...campaignData,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      sentCount: 0,
      openRate: 0
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  updateCampaign(id, campaignData) {
    const index = this.campaigns.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      this.campaigns[index] = { ...this.campaigns[index], ...campaignData };
      return this.campaigns[index];
    }
    return null;
  }

  deleteCampaign(id) {
    const index = this.campaigns.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      return this.campaigns.splice(index, 1)[0];
    }
    return null;
  }

  // Segment methods
  getSegments() {
    return this.segments;
  }

  getSegmentById(id) {
    return this.segments.find(s => s.id === parseInt(id));
  }

  createSegment(segmentData) {
    const newSegment = {
      id: Date.now(),
      ...segmentData,
      customerCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.segments.push(newSegment);
    return newSegment;
  }

  updateSegment(id, segmentData) {
    const index = this.segments.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      this.segments[index] = { ...this.segments[index], ...segmentData };
      return this.segments[index];
    }
    return null;
  }

  deleteSegment(id) {
    const index = this.segments.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      return this.segments.splice(index, 1)[0];
    }
    return null;
  }

  // Statistics
  getStats() {
    const totalCustomers = this.customers.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      activeCampaigns,
      pendingOrders,
      averageOrderValue
    };
  }

  getOrderStats() {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    const completedOrders = this.orders.filter(o => o.status === 'completed').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue
    };
  }
}

// Create singleton instance
const dataStore = new DataStore();

export { dataStore };
