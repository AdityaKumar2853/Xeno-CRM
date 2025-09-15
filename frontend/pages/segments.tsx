import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { segmentAPI } from '@/lib/api';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Segments: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
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

  // Create segment mutation
  const createSegmentMutation = useMutation(segmentAPI.createSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['segments']);
      toast.success('Segment created successfully!');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create segment error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create segment');
    },
  });

  // Update segment mutation
  const updateSegmentMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => segmentAPI.updateSegment(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['segments']);
        toast.success('Segment updated successfully!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        console.error('Update segment error:', error);
        toast.error(error.response?.data?.error?.message || 'Failed to update segment');
      },
    }
  );

  // Delete segment mutation
  const deleteSegmentMutation = useMutation(segmentAPI.deleteSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['segments']);
      toast.success('Segment deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete segment error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete segment');
    },
  });

  const { data: segments, isLoading, error } = useQuery(
    ['segments', currentPage, pageSize, debouncedSearchQuery],
    () => segmentAPI.getSegments({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchQuery || undefined,
    }),
    {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Failed to fetch segments:', error);
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

  const segmentsData = segments?.data?.data?.segments || [];

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rules: '',
    });
    setEditingSegment(null);
  };

  const handleAddSegment = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditSegment = (segment: any) => {
    // Convert rules object back to string for editing
    const rulesString = segment.rules ? 
      (typeof segment.rules === 'string' ? 
        segment.rules : 
        `${segment.rules.field} ${segment.rules.operator} ${segment.rules.value}`
      ) : 
      '';
    
    setFormData({
      name: segment.name || '',
      description: segment.description || '',
      rules: rulesString,
    });
    setEditingSegment(segment);
    setShowModal(true);
  };

  const handleDeleteSegment = (segmentId: string) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      deleteSegmentMutation.mutate(segmentId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse rules string into proper object format
    const parseRules = (rulesString: string) => {
      // Simple parsing for common rule patterns
      // This is a basic implementation - in production you'd want more sophisticated parsing
      const rules = rulesString.trim();
      
      // Handle simple conditions like "total_spent > 10000"
      if (rules.includes('>') || rules.includes('<') || rules.includes('=')) {
        const parts = rules.split(/\s*(>|<|>=|<=|=|!=)\s*/);
        if (parts.length === 3) {
          const [field, operator, value] = parts;
          return {
            field: field.trim(),
            operator: operator.trim() === '=' ? 'eq' : 
                     operator.trim() === '!=' ? 'ne' :
                     operator.trim() === '>' ? 'gt' :
                     operator.trim() === '>=' ? 'gte' :
                     operator.trim() === '<' ? 'lt' :
                     operator.trim() === '<=' ? 'lte' : 'eq',
            value: isNaN(Number(value)) ? value.trim() : Number(value)
          };
        }
      }
      
      // Handle contains conditions like "email contains @gmail.com"
      if (rules.toLowerCase().includes('contains')) {
        const parts = rules.split(/\s+contains\s+/i);
        if (parts.length === 2) {
          return {
            field: parts[0].trim(),
            operator: 'contains',
            value: parts[1].trim()
          };
        }
      }
      
      // Default fallback - treat as a simple contains rule on name field
      return {
        field: 'name',
        operator: 'contains',
        value: rules
      };
    };

    const submitData = {
      ...formData,
      rules: parseRules(formData.rules)
      // Remove userId for now - will be handled by backend
    };

    if (editingSegment) {
      updateSegmentMutation.mutate({
        id: editingSegment.id,
        data: submitData,
      });
    } else {
      createSegmentMutation.mutate(submitData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              <h1 className="text-2xl font-bold text-gray-900">Customer Segments</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage customer segments for targeted campaigns
              </p>
            </div>
            <button 
              onClick={handleAddSegment}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Segment
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              key="segment-search-input"
              type="text"
              placeholder="Search segments..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
              autoComplete="off"
            />
          </div>

          {/* Segments Table */}
          <div className="card">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rules
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {segmentsData?.map((segment: any) => (
                      <tr key={segment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {segment.name || 'No Name'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {segment.description || 'No Description'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {segment.rules ? 
                              (typeof segment.rules === 'string' ? 
                                segment.rules : 
                                `${segment.rules.field} ${segment.rules.operator} ${segment.rules.value}`
                              ) : 
                              'No Rules'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {segment.customerCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleEditSegment(segment)}
                            className="text-primary-600 hover:text-primary-900 mr-4 flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteSegment(segment.id)}
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

          {segmentsData?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No segments found</p>
            </div>
          )}

          {/* Segment Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingSegment ? 'Edit Segment' : 'Add New Segment'}
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
                      <label className="block text-sm font-medium text-gray-700">Rules</label>
                      <textarea
                        name="rules"
                        value={formData.rules}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., total_spent > 10000 or email contains @gmail.com"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Supported formats: field operator value (e.g., total_spent &gt; 10000, email contains @gmail.com)
                      </p>
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
                        disabled={createSegmentMutation.isLoading || updateSegmentMutation.isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                      >
                        {createSegmentMutation.isLoading || updateSegmentMutation.isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Segments;
