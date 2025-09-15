import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { orderAPI, customerAPI } from '@/lib/api';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  
  const { dialogState, showConfirmDialog, closeDialog, handleConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState({
    customerId: '',
    orderNumber: '',
    totalAmount: '',
    status: 'pending',
  });

  const queryClient = useQueryClient();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get customers for dropdown
  const { data: customers } = useQuery('customers', () => customerAPI.getCustomers({ page: 1, limit: 1000 }));

  // Create order mutation
  const createOrderMutation = useMutation(orderAPI.createOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('Order created successfully!');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create order');
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => orderAPI.updateOrder(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
        toast.success('Order updated successfully!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || 'Failed to update order');
      },
    }
  );

  // Delete order mutation
  const deleteOrderMutation = useMutation(orderAPI.deleteOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('Order deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete order');
    },
  });

  const { data: orders, isLoading, error } = useQuery(
    ['orders', currentPage, pageSize, debouncedSearchQuery],
    () => orderAPI.getOrders({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchQuery || undefined,
    }),
    {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Failed to fetch orders:', error);
      }
    }
  );

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  const ordersData = orders?.data?.data || [];
  
  // Debug logging
  console.log('Orders query result:', orders);
  console.log('Orders data:', ordersData);
  console.log('Orders data length:', ordersData.length);

  // Helper functions
  const resetForm = () => {
    setFormData({
      customerId: '',
      orderNumber: '',
      totalAmount: '',
      status: 'pending',
    });
    setEditingOrder(null);
  };

  const handleAddOrder = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditOrder = (order: any) => {
    setFormData({
      customerId: order.customerId || '',
      orderNumber: order.orderNumber || '',
      totalAmount: order.totalAmount?.toString() || '',
      status: order.status || 'pending',
    });
    setEditingOrder(order);
    setShowModal(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    showConfirmDialog({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        deleteOrderMutation.mutate(orderId);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
    };
    
    if (editingOrder) {
      updateOrderMutation.mutate({
        id: editingOrder.id,
        data: submitData,
      });
    } else {
      createOrderMutation.mutate(submitData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage customer orders
              </p>
            </div>
            <button 
              onClick={handleAddOrder}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Order
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              key="order-search-input"
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
              autoComplete="off"
            />
          </div>

          {/* Orders Table */}
          <div className="card">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordersData?.map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer?.name || order.customer?.email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.totalAmount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleEditOrder(order)}
                            className="text-primary-600 hover:text-primary-900 mr-4 flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto z-[60]">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingOrder ? 'Edit Order' : 'Add New Order'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <select
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select a customer</option>
                        {customers?.data?.data?.map((customer: any) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name || customer.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Number</label>
                      <input
                        type="text"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <input
                        type="number"
                        name="totalAmount"
                        value={formData.totalAmount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createOrderMutation.isLoading || updateOrderMutation.isLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                          {createOrderMutation.isLoading || updateOrderMutation.isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        type={dialogState.type}
      />
    </AuthGuard>
  );
};

export default Orders;
