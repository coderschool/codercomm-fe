import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '../../lib/apiService';
import useStore from '../../lib/store';

// Get current user profile
export const useGetCurrentUserProfile = () => {
  const queryClient = useQueryClient();
  const setCurrentUser = useStore(state => state.setCurrentUser);
  
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const response = await apiService.get('/users/me');
      setCurrentUser(response);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// Get user by ID
export const useGetUserProfile = (userId) => {
  const setSelectedUser = useStore(state => state.setSelectedUser);
  
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiService.get(`/users/${userId}`);
      setSelectedUser(response);
      return response;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
  });
};

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      name,
      avatarUrl,
      coverUrl,
      aboutMe,
      city,
      country,
      company,
      jobTitle,
      facebookLink,
      instagramLink,
      linkedinLink,
      twitterLink,
      phoneNumber,
      address,
    }) => {
      const data = {
        name,
        avatarUrl,
        coverUrl,
        aboutMe,
        city,
        country,
        company,
        jobTitle,
        facebookLink,
        instagramLink,
        linkedinLink,
        twitterLink,
        phoneNumber,
        address,
      };
      
      const response = await apiService.put(`/users/${userId}`, data);
      return response;
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users', data._id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};