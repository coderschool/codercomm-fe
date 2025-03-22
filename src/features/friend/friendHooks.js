import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiService from '../../lib/apiService';
import { USERS_PER_PAGE } from '../../lib/config';

// Get all users (for user discovery)
export const useGetUsers = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['users', 'discover', filterName, page],
    queryFn: async () => {
      const params = { page, limit: USERS_PER_PAGE };
      if (filterName) params.name = filterName;
      
      const response = await apiService.get('/users', { params });
      return response;
    },
  });
};

// Get friends
export const useGetFriends = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', filterName, page],
    queryFn: async () => {
      const params = { page, limit: USERS_PER_PAGE };
      if (filterName) params.name = filterName;
      
      const response = await apiService.get('/friends', { params });
      return response;
    },
  });
};

// Get incoming friend requests
export const useGetFriendRequests = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', 'requests', 'incoming', filterName, page],
    queryFn: async () => {
      const params = { page, limit: USERS_PER_PAGE };
      if (filterName) params.name = filterName;
      
      const response = await apiService.get('/friends/requests/incoming', { params });
      return response;
    },
  });
};

// Get outgoing friend requests
export const useGetOutgoingRequests = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', 'requests', 'outgoing', filterName, page],
    queryFn: async () => {
      const params = { page, limit: USERS_PER_PAGE };
      if (filterName) params.name = filterName;
      
      const response = await apiService.get('/friends/requests/outgoing', { params });
      return response;
    },
  });
};

// Send friend request
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.post('/friends/requests', {
        to: targetUserId,
      });
      
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request sent');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });
};

// Accept friend request
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.put(`/friends/requests/${targetUserId}`, {
        status: 'accepted',
      });
      
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request accepted');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });
};

// Decline friend request
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.put(`/friends/requests/${targetUserId}`, {
        status: 'declined',
      });
      
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request declined');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to decline friend request');
    },
  });
};

// Cancel a sent friend request
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.delete(`/friends/requests/${targetUserId}`);
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request cancelled');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel friend request');
    },
  });
};

// Remove a friend
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.delete(`/friends/${targetUserId}`);
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend removed');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove friend');
    },
  });
};