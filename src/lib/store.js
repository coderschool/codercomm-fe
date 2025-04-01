import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import apiService from './apiService';
import { isValidToken } from '../utils/jwt';

/**
 * Set or remove authentication session token
 */
const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete apiService.defaults.headers.common.Authorization;
  }
};

/**
 * Main application state store using Zustand
 */
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Auth state
        isAuthenticated: false,
        isInitialized: false,
        currentUser: null,
        
        // User state
        selectedUser: null,
        
        // Post state
        posts: [],
        totalPostPages: 0,
        
        // Comment state
        comments: {},
        totalCommentsByPost: {},
        
        // Friend state
        friends: [],
        friendRequests: {
          incoming: [],
          outgoing: [],
        },
        totalFriendPages: 0,
        
        // Loading states
        isLoading: {
          auth: false,
          posts: false,
          comments: false,
          friends: false,
          user: false,
        },
        
        // Error states
        errors: {
          auth: null,
          posts: null,
          comments: null,
          friends: null,
          user: null,
        },
        
        // Auth actions
        initializeAuth: async () => {
          try {
            set({ isLoading: { ...get().isLoading, auth: true } });
            const accessToken = localStorage.getItem('accessToken');
            
            if (accessToken && isValidToken(accessToken)) {
              setSession(accessToken);
              const user = await apiService.get('/users/me');
              set({ 
                currentUser: user,
                isAuthenticated: true,
                isInitialized: true,
                isLoading: { ...get().isLoading, auth: false },
                errors: { ...get().errors, auth: null },
              });
              return true;
            } else {
              setSession(null);
              set({ 
                currentUser: null,
                isAuthenticated: false,
                isInitialized: true,
                isLoading: { ...get().isLoading, auth: false },
              });
              return false;
            }
          } catch (error) {
            setSession(null);
            set({ 
              currentUser: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: error.message || 'Failed to initialize authentication' },
            });
            return false;
          }
        },
        
        login: async (credentials) => {
          try {
            set({ isLoading: { ...get().isLoading, auth: true } });
            const response = await apiService.post('/auth/login', credentials);
            const { user, accessToken } = response;
            
            setSession(accessToken);
            
            set({ 
              currentUser: user,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: null },
            });
            
            toast.success('Login successful');
            return user;
          } catch (error) {
            set({ 
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: error.message || 'Login failed' },
            });
            toast.error(error.message || 'Login failed');
            throw error;
          }
        },
        
        register: async (userData) => {
          try {
            set({ isLoading: { ...get().isLoading, auth: true } });
            const response = await apiService.post('/users', userData);
            const { user, accessToken } = response;
            
            setSession(accessToken);
            
            set({ 
              currentUser: user,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: null },
            });
            
            toast.success('Registration successful');
            return user;
          } catch (error) {
            set({ 
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: error.message || 'Registration failed' },
            });
            toast.error(error.message || 'Registration failed');
            throw error;
          }
        },
        
        logout: () => {
          setSession(null);
          set({ 
            currentUser: null,
            isAuthenticated: false,
            errors: { ...get().errors, auth: null },
          });
          toast.success('Logged out successfully');
        },
        
        // User actions
        setSelectedUser: (user) => set({ selectedUser: user }),
        
        // Post actions
        setPosts: (posts, totalPages) => set({ 
          posts: posts,
          totalPostPages: totalPages 
        }),
        
        // Comment actions
        setComments: (postId, comments, totalComments) => set({
          comments: { 
            ...get().comments, 
            [postId]: comments 
          },
          totalCommentsByPost: {
            ...get().totalCommentsByPost,
            [postId]: totalComments
          }
        }),
        
        // Friend actions
        setFriends: (friends, totalPages) => set({ 
          friends: friends, 
          totalFriendPages: totalPages 
        }),
        
        setFriendRequests: (incoming, outgoing) => set({
          friendRequests: { incoming, outgoing }
        }),
        
        // Loading and error state
        setLoading: (feature, loading) => set({ 
          isLoading: { ...get().isLoading, [feature]: loading }
        }),
        
        setError: (feature, error) => set({
          errors: { ...get().errors, [feature]: error }
        }),
      }),
      {
        name: 'codercomm-storage',
        partialize: (state) => ({ 
          // Only persist these specific states
          isAuthenticated: state.isAuthenticated,
          currentUser: state.currentUser,
        }),
      }
    )
  )
);

export default useStore;