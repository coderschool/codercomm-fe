import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '../../lib/apiService';
import useStore from '../../lib/store';
import { isValidToken } from '../../utils/jwt';

/**
 * Set authentication token in localStorage and API headers
 * @param {string|null} accessToken - JWT token or null to clear
 */
export const setSession = (accessToken) => {
  if (accessToken) {
    window.localStorage.setItem("accessToken", accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    window.localStorage.removeItem("accessToken");
    delete apiService.defaults.headers.common.Authorization;
  }
};

/**
 * Check if user has a valid token and initialize auth state
 * @returns {Object} Token validation result
 */
export const checkAuthToken = () => {
  const accessToken = window.localStorage.getItem("accessToken");
  const isValid = accessToken && isValidToken(accessToken);
  
  if (isValid) {
    setSession(accessToken);
  }
  
  return { 
    isValid,
    accessToken: isValid ? accessToken : null
  };
};

/**
 * Login mutation hook
 * @returns {Object} Mutation object with login function
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setCurrentUser = useStore(state => state.setCurrentUser);
  
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await apiService.post("/auth/login", { email, password });
      return response;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data;
      
      // Set token in local storage and API headers
      setSession(accessToken);
      
      // Set user in store
      setCurrentUser(user);
      
      // Update React Query cache
      queryClient.setQueryData(['users', 'me'], user);
      
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed');
    }
  });
};

/**
 * Register mutation hook
 * @returns {Object} Mutation object with register function
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  const setCurrentUser = useStore(state => state.setCurrentUser);
  
  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const response = await apiService.post("/users", {
        name,
        email,
        password,
      });
      return response;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data;
      
      // Set token in local storage and API headers
      setSession(accessToken);
      
      // Set user in store
      setCurrentUser(user);
      
      // Update React Query cache
      queryClient.setQueryData(['users', 'me'], user);
      
      toast.success('Registration successful');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
    }
  });
};

/**
 * Logout mutation hook
 * @returns {Object} Mutation object with logout function
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useStore(state => state.logout);
  
  return useMutation({
    mutationFn: async () => {
      // No actual API call needed for logout in this app
      return true;
    },
    onSuccess: () => {
      // Clear token
      setSession(null);
      
      // Update Zustand store
      logout();
      
      // Clear relevant queries from cache
      queryClient.removeQueries({ queryKey: ['users', 'me'] });
      
      toast.success('Logged out successfully');
    }
  });
};