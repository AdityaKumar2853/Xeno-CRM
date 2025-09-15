import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { customerAPI, orderAPI, campaignAPI } from '@/lib/api';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  customers: {
    total: number;
    totalSpent: number;
    avgOrderValue: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  campaigns: {
    total: number;
    running: number;
    completed: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const { data: customerStats, error: customerError } = useQuery('customerStats', customerAPI.getCustomerStats, {
    retry: 1,
    retryDelay: 1000,
    onError: (error) => console.error('Failed to fetch customer stats:', error)
  });
  const { data: orderStats, error: orderError } = useQuery('orderStats', orderAPI.getOrderStats, {
    retry: 1,
    retryDelay: 1000,
    onError: (error) => console.error('Failed to fetch order stats:', error)
  });
  const { data: campaigns, error: campaignError } = useQuery('campaigns', () => campaignAPI.getCampaigns({ limit: 100 }), {
    retry: 1,
    retryDelay: 1000,
    onError: (error) => console.error('Failed to fetch campaigns:', error)
  });

  console.log('API Query Status:', {
    customerStats: { data: customerStats, error: customerError },
    orderStats: { data: orderStats, error: orderError },
    campaigns: { data: campaigns, error: campaignError }
  });
  
  console.log('Raw API Data:', {
    customerStatsData: customerStats,
    orderStatsData: orderStats,
    campaignsData: campaigns
  });
  
  // Let's see the actual structure of the API responses
  if (customerStats) {
    console.log('Customer Stats Structure:', JSON.stringify(customerStats, null, 2));
  }
  if (orderStats) {
    console.log('Order Stats Structure:', JSON.stringify(orderStats, null, 2));
  }
  if (campaigns) {
    console.log('Campaigns Structure:', JSON.stringify(campaigns, null, 2));
  }

  useEffect(() => {
    console.log('Dashboard data:', {
      customerStats: customerStats?.data?.data,
      orderStats: orderStats?.data?.data,
      campaigns: campaigns?.data?.data
    });

    const newStats = {
      customers: {
        total: customerStats?.data?.data?.totalCustomers || 0,
        totalSpent: parseFloat(customerStats?.data?.data?.totalSpent) || 0,
        avgOrderValue: parseFloat(customerStats?.data?.data?.avgOrderValue) || 0,
      },
      orders: {
        total: orderStats?.data?.data?.totalOrders || 0,
        totalRevenue: parseFloat(orderStats?.data?.data?.totalRevenue) || 0,
        avgOrderValue: parseFloat(orderStats?.data?.data?.avgOrderValue) || 0,
      },
      campaigns: {
        total: campaigns?.data?.data?.total || 0,
        running: campaigns?.data?.data?.campaigns?.filter((c: any) => c.status === 'running').length || 0,
        completed: campaigns?.data?.data?.campaigns?.filter((c: any) => c.status === 'completed').length || 0,
      },
    };

    console.log('Setting stats:', JSON.stringify(newStats, null, 2));
    setStats(newStats);
    setLoading(false);
  }, [customerStats, orderStats, campaigns]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  console.log('Current stats state:', JSON.stringify(stats, null, 2));
  
  const statCards = [
    {
      name: 'Total Customers',
      value: stats?.customers.total || 0,
      icon: UsersIcon,
      subtitle: `₹${(stats?.customers.totalSpent || 0).toLocaleString()} total spent`,
    },
    {
      name: 'Total Orders',
      value: stats?.orders.total || 0,
      icon: ShoppingBagIcon,
      subtitle: `₹${(stats?.orders.avgOrderValue || 0).toLocaleString()} avg order`,
    },
    {
      name: 'Total Revenue',
      value: `₹${(stats?.orders.totalRevenue || 0).toLocaleString()}`,
      icon: ChartBarIcon,
      subtitle: `${stats?.orders.total || 0} orders`,
    },
    {
      name: 'Active Campaigns',
      value: stats?.campaigns.running || 0,
      icon: ChartBarIcon,
      subtitle: `${stats?.campaigns.completed || 0} completed`,
    },
  ];
  
  console.log('Stat cards:', JSON.stringify(statCards, null, 2));

  return (
    <Layout>
      <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.name} className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <card.icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd className="flex flex-col">
                          <div className="text-2xl font-semibold text-gray-900">
                            {card.value}
                          </div>
                          {card.subtitle && (
                            <div className="text-sm text-gray-500 mt-1">
                              {card.subtitle}
                            </div>
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Customers */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Recent Customers</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {customerStats?.data?.data?.recentCustomers && customerStats.data.data.recentCustomers.length > 0 ? (
                    customerStats.data.data.recentCustomers.slice(0, 5).map((customer: any) => (
                      <div key={customer.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {customer.name?.charAt(0) || customer.email.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {customer.name || customer.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{customer.totalSpent?.toLocaleString() || 0} spent
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No recent customers found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Campaign Performance</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Campaigns</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats?.campaigns.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Running</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats?.campaigns.running || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed</span>
                    <span className="text-sm font-medium text-blue-600">
                      {stats?.campaigns.completed || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default Dashboard;
