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
  ArrowUpIcon,
  ArrowDownIcon,
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
  const { data: customerStats } = useQuery('customerStats', customerAPI.getCustomerStats, {
    retry: 1,
    retryDelay: 1000,
    onError: (error) => console.error('Failed to fetch customer stats:', error)
  });
  const { data: orderStats } = useQuery('orderStats', orderAPI.getOrderStats, {
    retry: 1,
    retryDelay: 1000,
    onError: (error) => console.error('Failed to fetch order stats:', error)
  });
  const { data: campaigns } = useQuery('campaigns', () => campaignAPI.getCampaigns({ limit: 1000 }), {
    retry: 1,
    retryDelay: 1000,
    onError: (error) => console.error('Failed to fetch campaigns:', error)
  });

  useEffect(() => {
    if (customerStats && orderStats && campaigns) {
      setStats({
        customers: {
          total: customerStats.data?.totalCustomers || 0,
          totalSpent: customerStats.data?.totalSpent || 0,
          avgOrderValue: customerStats.data?.avgOrderValue || 0,
        },
        orders: {
          total: orderStats.data?.totalOrders || 0,
          totalRevenue: orderStats.data?.totalRevenue || 0,
          avgOrderValue: orderStats.data?.avgOrderValue || 0,
        },
        campaigns: {
          total: campaigns.data?.total || 0,
          running: campaigns.data?.campaigns?.filter((c: any) => c.status === 'running').length || 0,
          completed: campaigns.data?.campaigns?.filter((c: any) => c.status === 'completed').length || 0,
        },
      });
    }
    setLoading(false);
  }, [customerStats, orderStats, campaigns]);

  if (loading) {
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

  const statCards = [
    {
      name: 'Total Customers',
      value: stats?.customers.total || 0,
      icon: UsersIcon,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Orders',
      value: stats?.orders.total || 0,
      icon: ShoppingBagIcon,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Revenue',
      value: `₹${(stats?.orders.totalRevenue || 0).toLocaleString()}`,
      icon: ChartBarIcon,
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Campaigns',
      value: stats?.campaigns.running || 0,
      icon: ChartBarIcon,
      change: '+3',
      changeType: 'positive' as const,
    },
  ];

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome to your Mini CRM dashboard. Here's what's happening with your business.
            </p>
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
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {card.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {card.changeType === 'positive' ? (
                              <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                            )}
                            <span className="sr-only">
                              {card.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                            </span>
                            {card.change}
                          </div>
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
                  {customerStats?.data.recentCustomers?.slice(0, 5).map((customer: any) => (
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
                  ))}
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
    </AuthGuard>
  );
};

export default Dashboard;
