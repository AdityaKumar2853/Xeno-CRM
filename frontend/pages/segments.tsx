import { useState } from 'react';
import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Segments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for segments
  const segments = [
    {
      id: '1',
      name: 'High Value Customers',
      description: 'Customers who have spent more than ₹10,000',
      criteria: 'total_spent > 10000',
      customerCount: 45,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Inactive Customers',
      description: 'Customers who haven\'t made a purchase in 90 days',
      criteria: 'last_order_date < 90_days_ago',
      customerCount: 123,
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'Frequent Buyers',
      description: 'Customers with more than 5 orders',
      criteria: 'order_count > 5',
      customerCount: 67,
      createdAt: '2024-01-05',
    },
  ];

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Segments</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage customer segments for targeted campaigns
              </p>
            </div>
            <button className="btn btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Segment
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
            />
          </div>

          {/* Segments Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSegments.map((segment) => (
              <div key={segment.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {segment.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {segment.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        Criteria: {segment.criteria}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {segment.customerCount} customers
                    </div>
                    <div className="text-xs text-gray-400">
                      Created {new Date(segment.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 btn btn-outline btn-sm">
                      View Customers
                    </button>
                    <button className="flex-1 btn btn-primary btn-sm">
                      Create Campaign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSegments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No segments found</p>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Segments;
