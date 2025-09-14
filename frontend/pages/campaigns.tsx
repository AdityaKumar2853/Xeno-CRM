import { useState } from 'react';
import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Campaigns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for campaigns
  const campaigns = [
    {
      id: '1',
      name: 'Welcome Campaign',
      description: 'Welcome new customers with a special offer',
      status: 'running',
      audience: 'New Customers',
      audienceSize: 25,
      sent: 20,
      delivered: 18,
      opened: 12,
      clicked: 8,
      createdAt: '2024-01-20',
    },
    {
      id: '2',
      name: 'Win-back Campaign',
      description: 'Re-engage inactive customers',
      status: 'completed',
      audience: 'Inactive Customers',
      audienceSize: 123,
      sent: 123,
      delivered: 110,
      opened: 45,
      clicked: 15,
      createdAt: '2024-01-15',
    },
    {
      id: '3',
      name: 'Holiday Sale',
      description: 'Special holiday discount for all customers',
      status: 'scheduled',
      audience: 'All Customers',
      audienceSize: 500,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      createdAt: '2024-01-10',
    },
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage marketing campaigns
              </p>
            </div>
            <button className="btn btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
            />
          </div>

          {/* Campaigns Table */}
          <div className="card">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Audience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {campaign.audience}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.audienceSize} customers
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>Sent: {campaign.sent}/{campaign.audienceSize}</div>
                            <div>Delivered: {campaign.delivered}</div>
                            <div>Opened: {campaign.opened}</div>
                            <div>Clicked: {campaign.clicked}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-4">
                            View
                          </button>
                          <button className="text-primary-600 hover:text-primary-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No campaigns found</p>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Campaigns;
