# State Management Setup

In this step, we'll set up Zustand for global state management and integrate it with React Query for data fetching.

## Create the Store

First, let's create our store. Create `src/lib/store.js`:

```javascript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        // User state
        user: {
          currentUser: null,
          selectedUser: null,
          loading: false,
          error: null,
        },
        
        // Auth state
        auth: {
          isAuthenticated: false,
          isInitialized: false,
        },
        
        // Post state
        post: {
          posts: [],
          totalPages: 0,
          loading: false,
          error: null,
        },
        
        // Comment state
        comment: {
          comments: {},
          totalCommentsByPost: {},
          loading: false,
          error: null,
        },
        
        // Friend state
        friend: {
          friends: [],
          friendRequests: {
            incoming: [],
            outgoing: [],
          },
          totalPages: 0,
          loading: false,
          error: null,
        },
        
        // User actions
        setCurrentUser: (user) => set((state) => ({
          user: { ...state.user, currentUser: user },
          auth: { 
            ...state.auth, 
            isAuthenticated: Boolean(user),
            isInitialized: true
          }
        })),
        
        setSelectedUser: (user) => set((state) => ({
          user: { ...state.user, selectedUser: user }
        })),
        
        // Auth actions
        setAuth: (isAuthenticated, isInitialized) => set((state) => ({
          auth: { ...state.auth, isAuthenticated, isInitialized }
        })),
        
        logout: () => set((state) => ({
          user: { ...state.user, currentUser: null },
          auth: { ...state.auth, isAuthenticated: false }
        })),
        
        // Post actions
        setPosts: (posts, totalPages) => set((state) => ({
          post: { ...state.post, posts, totalPages }
        })),
        
        // Comment actions
        setComments: (postId, comments, totalComments) => set((state) => ({
          comment: { 
            ...state.comment, 
            comments: { 
              ...state.comment.comments, 
              [postId]: comments 
            },
            totalCommentsByPost: {
              ...state.comment.totalCommentsByPost,
              [postId]: totalComments
            }
          }
        })),
        
        // Friend actions
        setFriends: (friends, totalPages) => set((state) => ({
          friend: { ...state.friend, friends, totalPages }
        })),
        
        setFriendRequests: (incoming, outgoing) => set((state) => ({
          friend: { 
            ...state.friend, 
            friendRequests: { incoming, outgoing } 
          }
        })),
        
        // Loading and error state
        setLoading: (feature, loading) => set((state) => ({
          [feature]: { ...state[feature], loading }
        })),
        
        setError: (feature, error) => set((state) => ({
          [feature]: { ...state[feature], error }
        })),
      }),
      {
        name: 'codercomm-storage',
        partialize: (state) => ({ 
          auth: { isAuthenticated: state.auth.isAuthenticated },
          user: { currentUser: state.user.currentUser }
        }),
      }
    )
  )
);

export default useStore;
```

## Create a Basic Loading Component

Create `src/components/LoadingScreen.jsx`:

```jsx
import React from "react";

/**
 * Standard loading screen component
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Loading message to display
 * @param {boolean} [props.fullScreen=true] - Whether to take up full screen
 * @returns {JSX.Element} Loading indicator
 */
function LoadingScreen({ message = "Loading...", fullScreen = true }) {
  const containerClass = fullScreen 
    ? "absolute inset-0 w-full h-full flex justify-center items-center" 
    : "w-full py-8 flex justify-center items-center";

  return (
    <div className={containerClass}>
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-3 text-lg">{message}</span>
    </div>
  );
}

export default LoadingScreen;
```

## Create a Logo Component

Create `src/components/Logo.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";

function Logo({ sx }) {
  return (
    <Link to="/" className="flex items-center">
      <div className="mr-4 text-2xl font-bold text-primary">
        &lt;/&gt; CoderComm
      </div>
    </Link>
  );
}

export default Logo;
```

## Create Authentication Hooks

Create `src/features/user/authHooks.js`:

```javascript
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
```

## Create the Auth Context

Create `src/contexts/AuthContext.jsx`:

```jsx
import { createContext, useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import useStore from "../lib/store";
import { checkAuthToken, setSession, useLogin, useRegister, useLogout } from "../features/user/authHooks";
import apiService from "../lib/apiService";

// Create context
const AuthContext = createContext(null);

/**
 * Authentication provider component
 * Uses React Query for data fetching and Zustand for state management
 */
function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get state and actions from Zustand
  const { 
    auth: { isAuthenticated, isInitialized },
    user: { currentUser },
    setCurrentUser,
    setAuth,
  } = useStore();

  // Auth mutation hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Initialize auth once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a valid token
        const { isValid, accessToken } = checkAuthToken();
        
        // No valid token? Early return
        if (!isValid) {
          setAuth(false, true);
          setIsLoading(false);
          return;
        }
        
        // Valid token - get user data
        try {
          const user = await apiService.get("/users/me");
          setCurrentUser(user);
          setAuth(true, true);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Token might be invalid despite passing our check
          setSession(null);
          setCurrentUser(null);
          setAuth(false, true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setSession(null);
        setCurrentUser(null);
        setAuth(false, true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API for auth actions
  const login = async (credentials, callback) => {
    const result = await loginMutation.mutateAsync(credentials);
    if (callback) callback();
    return result.user;
  };

  const register = async (userData, callback) => {
    const result = await registerMutation.mutateAsync(userData);
    if (callback) callback();
    return result.user;
  };

  const logout = async (callback) => {
    await logoutMutation.mutateAsync();
    if (callback) callback();
  };

  // Show loading state
  if (isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user: currentUser,
        login,
        register,
        logout,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
```

## Create the Auth Hook

Create `src/hooks/useAuth.js`:

```javascript
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Hook to access authentication context
 * @returns {Object} Auth context value containing:
 * - isAuthenticated: Boolean indicating if user is logged in
 * - isInitialized: Boolean indicating if auth is initialized
 * - user: Current user object or null
 * - login: Function to log in
 * - register: Function to register
 * - logout: Function to log out
 * - isLoggingIn: Boolean indicating if login is in progress
 * - isRegistering: Boolean indicating if registration is in progress
 * - isLoggingOut: Boolean indicating if logout is in progress
 */
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
```

## Update App.jsx

Now, update `src/App.jsx` to use the authentication provider:

```jsx
import React from "react";
import Router from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
```

## Test the Authentication Setup

We haven't created the router yet, but we can test the authentication functionality:

```jsx
// src/App.jsx
import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import useAuth from "./hooks/useAuth";

function MainContent() {
  const { isAuthenticated, user, login, logout, isLoggingIn } = useAuth();
  
  const handleLogin = async () => {
    await login({ email: "alex@example.com", password: "password123" });
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">CoderComm</h1>
        
        {isAuthenticated ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}!</h2>
            <p className="text-gray-700">Email: {user.email}</p>
            <button 
              onClick={logout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-gray-700 mb-4">You are not logged in.</p>
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
```

Now run your application and test the login functionality:

```bash
npm run dev
```

You should be able to log in using the credentials from your mock API, and the UI will update to show the authenticated user. The logout button should also work correctly.

In the next step, we'll set up routing and layout components.