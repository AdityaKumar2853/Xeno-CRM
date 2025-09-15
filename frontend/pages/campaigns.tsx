import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { campaignAPI, segmentAPI } from '@/lib/api';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Campaigns: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  
  const { dialogState, showConfirmDialog, closeDialog, handleConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    audience: '',
    message: '',
    segmentId: '',
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Create campaign mutation
  const createCampaignMutation = useMutation(campaignAPI.createCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      toast.success('Campaign created successfully!');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create campaign error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create campaign');
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => campaignAPI.updateCampaign(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['campaigns']);
        toast.success('Campaign updated successfully!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        console.error('Update campaign error:', error);
        toast.error(error.response?.data?.error?.message || 'Failed to update campaign');
      },
    }
  );

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation(campaignAPI.deleteCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      toast.success('Campaign deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete campaign error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete campaign');
    },
  });

  const { data: campaigns, isLoading, error } = useQuery(
    ['campaigns', currentPage, pageSize, debouncedSearchQuery],
    () => campaignAPI.getCampaigns({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchQuery || undefined,
    }),
    {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Failed to fetch campaigns:', error);
      }
    }
  );

  // Fetch segments for dropdown
  const { data: segments, error: segmentsError, isLoading: segmentsLoading } = useQuery(
    ['segments'],
    () => segmentAPI.getSegments({ page: 1, limit: 100 }),
    {
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch segments:', error);
      }
    }
  );

  // Debug logging for segments
  if (process.env.NODE_ENV === 'development') {
    console.log('Segments query result:', { segments, segmentsError, segmentsLoading });
    console.log('Segments data structure:', segments?.data?.data);
  }

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

  const campaignsData = campaigns?.data?.data || [];

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      audience: '',
      message: '',
      segmentId: '',
    });
    setEditingCampaign(null);
  };

  const handleAddCampaign = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditCampaign = (campaign: any) => {
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      status: campaign.status || 'draft',
      audience: campaign.audience || '',
      message: campaign.message || '',
      segmentId: campaign.segmentId || '',
    });
    setEditingCampaign(campaign);
    setShowModal(true);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    showConfirmDialog({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        deleteCampaignMutation.mutate(campaignId);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampaign) {
      updateCampaignMutation.mutate({
        id: editingCampaign.id,
        data: formData,
      });
    } else {
      createCampaignMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            <button 
              onClick={handleAddCampaign}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              key="campaign-search-input"
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
              autoComplete="off"
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
                    {campaignsData?.map((campaign: any) => (
                      <tr key={campaign.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.description || 'No Description'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {campaign.audience || 'No Audience'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.audienceSize || 0} customers
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>Sent: {campaign.sent || 0}/{campaign.audienceSize || 0}</div>
                            <div>Delivered: {campaign.delivered || 0}</div>
                            <div>Opened: {campaign.opened || 0}</div>
                            <div>Clicked: {campaign.clicked || 0}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleEditCampaign(campaign)}
                            className="text-primary-600 hover:text-primary-900 mr-4 flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCampaign(campaign.id)}
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

          {campaignsData?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No campaigns found</p>
            </div>
          )}

          {/* Campaign Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto z-[60]">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
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
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="running">Running</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Segment</label>
                      <select
                        name="segmentId"
                        value={formData.segmentId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select a segment</option>
                        {segments?.data?.data?.map((segment: any) => (
                          <option key={segment.id} value={segment.id}>
                            {segment.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Audience</label>
                      <input
                        type="text"
                        name="audience"
                        value={formData.audience}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., High Value Customers"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter your campaign message..."
                        required
                      />
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
                          disabled={createCampaignMutation.isLoading || updateCampaignMutation.isLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                          {createCampaignMutation.isLoading || updateCampaignMutation.isLoading ? 'Saving...' : 'Save'}
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

export default Campaigns;
