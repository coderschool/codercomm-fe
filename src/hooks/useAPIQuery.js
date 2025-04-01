import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '@/lib/apiService';
import useStore from '@/lib/store';

/**
 * Custom hook for standardized API queries
 * @param {string} queryKey - The query key for caching
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} options - Additional options
 * @param {Object} options.params - Query parameters
 * @param {boolean} options.enabled - Whether the query should auto-fetch
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.select - Transform response data
 * @returns {Object} React Query result
 */
export const useAPIQuery = (queryKey, endpoint, options = {}) => {
  const { params, enabled = true, onSuccess, onError, select } = options;
  const setError = useStore(state => state.setError);
  const setLoading = useStore(state => state.setLoading);
  
  // Extract feature name from queryKey[0]
  const feature = Array.isArray(queryKey) ? queryKey[0] : queryKey;
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        setLoading(feature, true);
        const response = await apiService.get(endpoint, { params });
        setLoading(feature, false);
        return response;
      } catch (error) {
        setError(feature, error.message);
        setLoading(feature, false);
        throw error;
      }
    },
    enabled,
    onSuccess: (data) => {
      setError(feature, null);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      setError(feature, error.message);
      if (onError) onError(error);
      else toast.error(error.message || `Failed to fetch ${feature} data`);
    },
    select,
  });
};

/**
 * Custom hook for standardized API mutations (create, update, delete)
 * @param {Object} options - Mutation options
 * @param {string} options.feature - Feature name for error/loading state tracking
 * @param {string} options.endpoint - API endpoint
 * @param {string} options.method - HTTP method (post, put, delete)
 * @param {Array} options.invalidateQueries - Query keys to invalidate on success
 * @param {string} options.successMessage - Toast message on success
 * @param {string} options.errorMessage - Toast message on error
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} React Query mutation result
 */
export const useAPIMutation = (options) => {
  const { 
    feature,
    endpoint, 
    method = 'post',
    invalidateQueries = [],
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  } = options;
  
  const queryClient = useQueryClient();
  const setError = useStore(state => state.setError);
  const setLoading = useStore(state => state.setLoading);
  
  return useMutation({
    mutationFn: async (data) => {
      try {
        setLoading(feature, true);
        const response = await apiService[method](endpoint, data);
        setLoading(feature, false);
        return response;
      } catch (error) {
        setError(feature, error.message);
        setLoading(feature, false);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      setError(feature, null);
      
      // Invalidate relevant queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      if (successMessage) toast.success(successMessage);
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => {
      setError(feature, error.message);
      if (errorMessage) toast.error(errorMessage);
      else toast.error(error.message || `Operation failed`);
      if (onError) onError(error);
    },
  });
};

/**
 * Custom hook for standardized infinite queries (pagination)
 * @param {Array} queryKey - Query key for caching
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional options
 * @param {Object} options.params - Base query parameters
 * @param {string} options.pageParam - Name of the page parameter
 * @param {number} options.limit - Items per page
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} React Query infinite query result
 */
export const useAPIInfiniteQuery = (queryKey, endpoint, options = {}) => {
  const { 
    params = {}, 
    pageParam = 'page',
    limit = 10,
    onSuccess,
    onError
  } = options;
  
  const feature = Array.isArray(queryKey) ? queryKey[0] : queryKey;
  const setError = useStore(state => state.setError);
  const setLoading = useStore(state => state.setLoading);
  
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam: page = 1 }) => {
      try {
        setLoading(feature, true);
        const queryParams = { 
          ...params, 
          [pageParam]: page, 
          limit 
        };
        
        const response = await apiService.get(endpoint, { params: queryParams });
        setLoading(feature, false);
        
        return {
          ...response,
          currentPage: page,
        };
      } catch (error) {
        setError(feature, error.message);
        setLoading(feature, false);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      // Check if there are more pages
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined; // No more pages
    },
    onSuccess: (data) => {
      setError(feature, null);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      setError(feature, error.message);
      if (onError) onError(error);
      else toast.error(error.message || `Failed to fetch ${feature} data`);
    },
  });
}; 