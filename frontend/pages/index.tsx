import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import dynamic from 'next/dynamic';
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


  useEffect(() => {
    const newStats = {
      customers: {
        total: customerStats?.data?.data?.totalCustomers || 0,
        totalSpent: parseFloat(customerStats?.data?.data?.totalRevenue) || 0,
        avgOrderValue: parseFloat(orderStats?.data?.data?.averageOrderValue) || 0,
      },
      orders: {
        total: orderStats?.data?.data?.totalOrders || 0,
        totalRevenue: parseFloat(orderStats?.data?.data?.totalRevenue) || 0,
        avgOrderValue: parseFloat(orderStats?.data?.data?.averageOrderValue) || 0,
      },
      campaigns: {
        total: campaigns?.data?.data?.length || 0,
        running: campaigns?.data?.data?.filter((c: any) => c.status === 'running').length || 0,
        completed: campaigns?.data?.data?.filter((c: any) => c.status === 'completed').length || 0,
      },
    };

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
  

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome to your CRM overview</p>
            </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((card, index) => (
              <div key={card.name} className="card hover-lift animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-gray-600 truncate">
                          {card.name}
                        </dt>
                        <dd className="flex flex-col">
                          <div className="text-3xl font-bold text-gray-900">
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
            <div className="card hover-lift animate-slide-up">
              <div className="card-header">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mr-3">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                  Recent Customers
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {customerStats?.data?.data?.recentCustomers && customerStats.data.data.recentCustomers.length > 0 ? (
                    customerStats.data.data.recentCustomers.slice(0, 5).map((customer: any, index: number) => (
                      <div key={customer.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-blue-50/50 transition-colors duration-200" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                              {customer.name?.charAt(0) || customer.email.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {customer.name || customer.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{customer.totalSpent?.toLocaleString() || 0} spent
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <UsersIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No recent customers found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="card hover-lift animate-slide-up">
              <div className="card-header">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mr-3">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  Campaign Performance
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                    <span className="text-sm font-semibold text-gray-600">Total Campaigns</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {stats?.campaigns.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                    <span className="text-sm font-semibold text-gray-600">Running</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats?.campaigns.running || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                    <span className="text-sm font-semibold text-gray-600">Completed</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats?.campaigns.completed || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
};

// Use dynamic import to prevent hydration issues
const DynamicDashboard = dynamic(() => Promise.resolve(Dashboard), {
  ssr: false,
  loading: () => (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    </Layout>
  )
});

export default DynamicDashboard;
