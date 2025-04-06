import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import apiService from './apiService';
import { isValidToken } from '../utils/jwt';

/**
 * Helper function: Set or remove the authentication token in localStorage
 * and update the default Authorization header for apiService.
 * @param {string | null} accessToken - The JWT token or null to clear.
 */
const setSession = (accessToken) => {
  if (accessToken) {
    // Store token in browser's local storage for persistence
    localStorage.setItem('accessToken', accessToken);
    // Set the token as the default Authorization header for all API requests
    // Need to handle potential initial call before apiService is fully initialized
    if (apiService?.defaults?.headers?.common) {
        apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
        console.warn("apiService not ready when setting initial session header");
    }
  } else {
    // Remove token from local storage
    localStorage.removeItem('accessToken');
    // Remove the Authorization header from future API requests
    if (apiService?.defaults?.headers?.common) {
        delete apiService.defaults.headers.common.Authorization;
    }
  }
};

/**
 * Main application state store using Zustand.
 * Uses `devtools` for Redux DevTools integration and `persist` for localStorage persistence.
 */
const useStore = create(
  // 1. devtools middleware: Allows debugging the store with Redux DevTools Extension
  devtools(
    // 2. persist middleware: Saves specified parts of the store to localStorage
    persist(
      // 3. The store creator function: receives `set` and `get` from Zustand
      (set, get) => ({
        // --- State Properties ---
        
        // Auth State
        isAuthenticated: false, // Is the user currently logged in?
        isInitialized: false,   // Has the app checked for an existing token?
        currentUser: null,      // Holds the logged-in user object
        
        // Other State (Example - we might add more later)
        selectedUser: null, // Example: To view someone else's profile
        
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
        
        // Loading and Error States (Organized by feature)
        // It's good practice to track loading/error states per feature
        isLoading: {
          auth: false, // Loading state specifically for auth operations (login, register, init)
          posts: false,
          comments: false,
          friends: false,
          user: false,
        },
        errors: {
          auth: null, // Errors specifically from auth operations
          posts: null,
          comments: null,
          friends: null,
          user: null,
        },
        
        // --- Actions (Functions to modify state) ---
        
        // Auth Actions
        initializeAuth: async () => {
          // This action runs when the app starts
          set({ isLoading: { ...get().isLoading, auth: true } }); // Set loading state
          try {
            const accessToken = localStorage.getItem('accessToken');
            
            // Check if a token exists and is still valid (not expired)
            if (accessToken && isValidToken(accessToken)) {
              setSession(accessToken); // Set token for API calls
              // Fetch the current user's data using the token
              const response = await apiService.get('/users/me');
              // Assuming apiService interceptor returns { data: ... } 
              // or the interceptor modifies it to return data directly
              const user = response.data; 
              
              set({ 
                currentUser: user,
                isAuthenticated: true,
                isInitialized: true, // Mark auth as initialized
                isLoading: { ...get().isLoading, auth: false }, // Clear loading
                errors: { ...get().errors, auth: null }, // Clear any previous error
              });
              console.log("Auth Initialized: User Logged In", user);
              return true;
            } else {
              // No valid token found
              setSession(null); // Ensure session is cleared
              set({ 
                currentUser: null,
                isAuthenticated: false,
                isInitialized: true, // Mark auth as initialized
                isLoading: { ...get().isLoading, auth: false }, // Clear loading
              });
              console.log("Auth Initialized: No User Logged In");
              return false;
            }
          } catch (error) {
            // Handle errors during initialization (e.g., network error, invalid token on backend)
            console.error("Auth Initialization Error:", error);
            setSession(null); // Clear session on error
            set({ 
              currentUser: null,
              isAuthenticated: false,
              isInitialized: true, // Still mark as initialized, even with error
              isLoading: { ...get().isLoading, auth: false }, // Clear loading
              errors: { ...get().errors, auth: error.message || 'Failed to initialize authentication' },
            });
            return false;
          }
        },
        
        login: async (credentials) => {
          set({ isLoading: { ...get().isLoading, auth: true }, errors: { ...get().errors, auth: null } });
          try {
            // Call the API's login endpoint
            const response = await apiService.post('/auth/login', credentials);
            const { user, accessToken } = response.data; // Extract user and token from response
            
            setSession(accessToken); // Store token
            
            set({ 
              currentUser: user,
              isAuthenticated: true,
              isLoading: { ...get().isLoading, auth: false }, // Clear loading
            });
            
            toast.success('Login successful');
            return user; // Return user data on success
          } catch (error) {
            console.error("Login Error:", error);
            // The apiService interceptor formats the error
            const errorMessage = error?.message || 'Login failed';
            set({ 
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: errorMessage },
            });
            toast.error(errorMessage);
            throw error; // Re-throw error for the component to handle (e.g., show error message)
          }
        },
        
        // Note: Our mock API currently disables registration, but the action is here
        register: async (userData) => {
          set({ isLoading: { ...get().isLoading, auth: true }, errors: { ...get().errors, auth: null } });
          try {
            // Call the API's registration endpoint
            const response = await apiService.post('/users', userData);
            // Assuming registration also returns user and token
            const { user, accessToken } = response.data;
            
            setSession(accessToken); // Store token
            
            set({ 
              currentUser: user,
              isAuthenticated: true, // Log user in immediately after registration
              isLoading: { ...get().isLoading, auth: false },
            });
            
            toast.success('Registration successful');
            return user;
          } catch (error) {
            console.error("Registration Error:", error);
            const errorMessage = error?.message || 'Registration failed';
            set({ 
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: errorMessage },
            });
            toast.error(errorMessage);
            throw error; // Re-throw error
          }
        },
        
        logout: () => {
          setSession(null); // Clear token
          set({ 
            currentUser: null,
            isAuthenticated: false,
            errors: { ...get().errors, auth: null }, // Clear any auth errors
          });
          toast.success('Logged out successfully');
        },
        
        // Other Actions (Example)
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
        
        // Generic Loading/Error Setters (Optional - can be useful)
        setLoading: (feature, loading) => set(state => ({ 
          isLoading: { ...state.isLoading, [feature]: loading }
        })),
        setError: (feature, error) => set(state => ({
          errors: { ...state.errors, [feature]: error }
        })),
      }),
      // Configuration object for the `persist` middleware
      {
        name: 'codercomm-storage', // Name of the item in localStorage
        // `partialize` lets you choose which parts of the store to persist.
        // We only persist auth status and user data, not loading/error states.
        partialize: (state) => ({ 
          isAuthenticated: state.isAuthenticated,
          currentUser: state.currentUser,
        }),
        // getStorage: () => localStorage, // Default is localStorage
      }
    )
  )
);

// Export the hook for components to use
export const useAppStore = useStore;