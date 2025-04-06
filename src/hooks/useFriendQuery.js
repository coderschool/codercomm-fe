import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery // Using infinite query for user search
} from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '@/lib/apiService'; // Use absolute path
import { getPaginationParams } from '@/lib/utils'; // Use absolute path

const USERS_PER_PAGE = 9; // Define items per page for pagination

// --- Queries --- 

/**
 * Fetches the current user's accepted friends list (paginated).
 */
export const useGetFriends = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', filterName, page], // Cache key includes filter and page
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: USERS_PER_PAGE, 
        filter: filterName,
        filterKey: 'name' // Ensure filter key matches API expectation
      });
      console.log("Fetching friends with params:", params);
      const response = await apiService.get('/friends', { params });
      // API returns { users: [], count: X, totalPages: Y }
      return response.data; 
    },
    keepPreviousData: true, // Keep previous data visible while fetching next page
  });
};

/**
 * Fetches incoming friend requests for the current user.
 */
export const useGetIncomingFriendRequests = () => {
  return useQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => {
      console.log("Fetching incoming friend requests...");
      const response = await apiService.get('/friends/requests/incoming');
      // API returns { requests: [], count: X, totalPages: Y } 
      // containing friendship object with embedded requester info
      return response.data;
    },
  });
};

/**
 * Fetches outgoing friend requests sent by the current user.
 */
export const useGetOutgoingFriendRequests = () => {
  return useQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => {
      console.log("Fetching outgoing friend requests...");
      const response = await apiService.get('/friends/requests/outgoing');
      // API returns { requests: [], count: X, totalPages: Y } 
      // containing friendship object with embedded recipient info
      return response.data;
    },
  });
};

/**
 * Fetches users for discovery/searching (infinite scroll).
 */
export const useSearchUsers = (filterName = '') => {
  return useInfiniteQuery({
    queryKey: ['users', 'search', filterName], // Key includes search term
    queryFn: async ({ pageParam = 1 }) => {
      const params = getPaginationParams({ 
          page: pageParam, 
          limit: USERS_PER_PAGE, 
          filter: filterName, 
          filterKey: 'name' 
      });
      console.log(`Searching users: name='${filterName}', page=${pageParam}`);
      const response = await apiService.get('/users', { params });
      // API returns { users: [], count: X, totalPages: Y }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!filterName, // Only run query if there is a search term
  });
};

// --- Mutations --- 

/**
 * Mutation hook to send a friend request.
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId) => {
      console.log(`Sending friend request to: ${targetUserId}`);
      const response = await apiService.post('/friends/requests', { to: targetUserId });
      return response.data; // API likely returns { success: true, ... }
    },
    onSuccess: (data, targetUserId) => {
      toast.success('Friend request sent');
      // Invalidate queries that display user lists or request status
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] }); // Refetch user search results
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });
      // Could potentially update specific user cache entry if needed
      // queryClient.invalidateQueries({ queryKey: ['users', targetUserId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });
};

/**
 * Mutation hook to accept an incoming friend request.
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID here is the ID of the person *who sent* the request
    mutationFn: async (requesterId) => {
      console.log(`Accepting friend request from: ${requesterId}`);
      // Mock API expects action in query param
      const response = await apiService.put(`/friends/requests/${requesterId}?action=accept`);
      return response.data; // API likely returns updated friendship
    },
    onSuccess: (data, requesterId) => {
      toast.success('Friend request accepted');
      // Invalidate requests list, friends list, and potentially user search
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      // Could update specific user caches if needed
      // queryClient.invalidateQueries({ queryKey: ['users', requesterId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });
};

/**
 * Mutation hook to decline an incoming friend request.
 */
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID is the requester's ID
    mutationFn: async (requesterId) => {
      console.log(`Declining friend request from: ${requesterId}`);
      // Mock API expects action in query param
      const response = await apiService.put(`/friends/requests/${requesterId}?action=decline`);
      return response.data; // API likely returns { success: true, ... }
    },
    onSuccess: (data, requesterId) => {
      toast.info('Friend request declined'); // Use info or success
      // Only need to invalidate incoming requests list
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
      // Maybe user search if status was shown there
      // queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to decline friend request');
    },
  });
};

/**
 * Mutation hook to cancel an outgoing friend request.
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID is the recipient's ID
    mutationFn: async (recipientId) => {
      console.log(`Cancelling friend request to: ${recipientId}`);
      await apiService.delete(`/friends/requests/${recipientId}`);
      // No response body expected on 204
      return recipientId; 
    },
    onSuccess: (recipientId) => {
      toast.info('Friend request cancelled');
      // Invalidate outgoing requests and user search
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      // queryClient.invalidateQueries({ queryKey: ['users', recipientId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel friend request');
    },
  });
};

/**
 * Mutation hook to remove a friend (unfriend).
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID is the friend's ID
    mutationFn: async (friendId) => {
      console.log(`Removing friend: ${friendId}`);
      await apiService.delete(`/friends/${friendId}`);
      // No response body expected on 204
      return friendId;
    },
    onSuccess: (friendId) => {
      toast.info('Friend removed');
      // Invalidate friends list and potentially user search/profile
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      // queryClient.invalidateQueries({ queryKey: ['users', friendId] });
      // Also invalidate incoming/outgoing requests in case something weird happened
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove friend');
    },
  });
}; 