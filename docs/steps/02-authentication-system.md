# Step 2: Authentication System

In this step, we'll implement the authentication system for our CoderComm application. We'll create login and registration pages, set up state management with Zustand, create an API service to talk to our (mock) backend, and add protected routes to control access.

## 1. Set Up the Auth Store (Zustand)

First, let's create our global state store using Zustand. This store will hold authentication status, user information, and related actions.

Create a new file in `src/lib/store.js`:

```jsx
// src/lib/store.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware'; // Import middleware
import { toast } from 'sonner'; // For notifications
import apiService from './apiService'; // We'll create this next
import { isValidToken } from '../utils/jwt'; // We'll create this next

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
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    // Remove token from local storage
    localStorage.removeItem('accessToken');
    // Remove the Authorization header from future API requests
    delete apiService.defaults.headers.common.Authorization;
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
        currentUser: null,      // Holds the logged-in user object
        
        // Other State (Example - we might add more later)
        selectedUser: null, // Example: To view someone else's profile
        
        // Loading and Error States (Organized by feature)
        // It's good practice to track loading/error states per feature
        isLoading: {
          auth: false, // Loading state specifically for auth operations 
        },
        errors: {
          auth: null, // Errors specifically from auth operations
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
              const user = response.data; // Extract user data from response
              
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
            set({ 
              isLoading: { ...get().isLoading, auth: false },
              errors: { ...get().errors, auth: error.message || 'Login failed' },
            });
            toast.error(error.message || 'Login failed');
            throw error; // Re-throw error for the component to handle (e.g., show error message)
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

export const useAppStore = useStore; // Export the hook
```

**Explanation:**

*   **`create`**: The core function from Zustand to create a store.
*   **`devtools`**: Middleware that connects your store to the Redux DevTools browser extension, making debugging much easier.
*   **`persist`**: Middleware that automatically saves parts of your store to `localStorage` (or another storage) and rehydrates it when the app loads. This keeps the user logged in even after refreshing the page.
    *   `name`: The key used in `localStorage`.
    *   `partialize`: A function to select only the state slices you want to persist (we don't need to save loading/error states).
*   **`set`**: Function provided by Zustand to update the state. It merges the updates automatically.
*   **`get`**: Function provided by Zustand to access the current state *inside* actions (useful for calculations or accessing other state pieces).
*   **`setSession`**: A helper function to manage the JWT token in `localStorage` and set the default `Authorization` header for our API calls.
*   **State Structure**: We organize state logically (auth, user, loading, errors). Tracking `isLoading` and `errors` per feature helps manage UI feedback effectively.
*   **Actions**: Functions like `initializeAuth`, `login`, `logout` handle asynchronous operations (API calls) and update the state accordingly using `set`. They also use `toast` for user feedback.

## 2. Create API Service and Utilities

Now, let's set up an Axios instance (`apiService`) to handle communication with our API (mock or real). We'll also create a utility to check if a JWT token is expired.

Create `src/lib/apiService.js`:

```jsx
// src/lib/apiService.js
import axios from "axios";

// --- Configuration ---

// Determine the base URL for API requests.
// If VITE_API_URL is set in your environment (e.g., in a .env file),
// use that. Otherwise, assume we're using the MirageJS mock server,
// which requires the '/api' prefix based on its configuration in server.js.
const baseURL = import.meta.env.VITE_API_URL || '/api'; 

console.log(` API Base URL: ${baseURL}`); // Log the base URL being used

// --- Create Axios Instance ---

const apiService = axios.create({ baseURL });

// --- Interceptors --- 
// Interceptors allow us to run code before a request is sent or after a response is received.

// Request Interceptor:
// - Adds the Authorization header automatically if a token exists in localStorage.
// - Logs the request details (optional, useful for debugging).
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Optional: Log request details for debugging
    // console.log("Starting Request:", {
    //   method: config.method,
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   fullURL: config.baseURL + config.url,
    //   headers: config.headers,
    //   data: config.data,
    // });
    return config;
  },
  (error) => {
    // Handle request setup errors (rare)
    console.error("Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor:
// - Automatically extracts the `data` field from successful responses.
// - Standardizes error handling by extracting the error message.
// - Logs response/error details (optional, useful for debugging).
apiService.interceptors.response.use(
  (response) => {
    // Optional: Log successful response details
    // console.log("Response Received:", {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data, // The actual data from the server
    // });
    // For successful responses (2xx status code), just return the data part
    return response; // Return the full response object initially
  },
  (error) => {
    // Handle errors (non-2xx status codes)
    console.error("API Response Error:", error.response || error.message);
    
    // Try to extract a meaningful error message from the response
    // This depends on how your backend structures error responses
    const message = 
      error.response?.data?.errors?.message || // Check nested structure first
      error.response?.data?.message ||       // Check direct message property
      error.response?.statusText ||          // Use status text if no message
      error.message ||                     // Use the generic Axios error message
      "An unexpected API error occurred";  // Fallback message

    // Reject the promise with a standardized error object
    return Promise.reject({ message });
  }
);

export default apiService;
```

Create the JWT utility file `src/utils/jwt.js`:

```jsx
// src/utils/jwt.js
import { jwtDecode } from 'jwt-decode'; // A library specifically for decoding JWTs

/**
 * Check if a JWT access token is still valid (not expired).
 * This is a basic client-side check. The server should always perform its own validation.
 * @param {string | null} accessToken - JWT token to validate.
 * @returns {boolean} - True if the token exists and hasn't expired, false otherwise.
 */
export const isValidToken = (accessToken) => {
  if (!accessToken) return false; // No token, definitely invalid
  
  try {
    // Decode the token to access its payload (claims)
    // The payload contains information like expiration time (`exp`)
    const decoded = jwtDecode(accessToken);
    
    // Get the current time in seconds (JWT `exp` is in seconds since epoch)
    const currentTime = Date.now() / 1000;
    
    // Compare the expiration time (`exp`) with the current time
    // If `exp` is in the future, the token is still valid
    return decoded.exp > currentTime;
  } catch (error) {
    // If decoding fails (e.g., invalid token format), consider it invalid
    console.error("Failed to decode JWT:", error);
    return false;
  }
};
```

**Explanation:**

*   **`apiService.js`**: We create a configured Axios instance. The `baseURL` is set based on environment variables (allowing easy switching between mock and real APIs). Interceptors are key: the request interceptor automatically adds the auth token, and the response interceptor standardizes success/error handling.
*   **`jwt.js`**: The `isValidToken` function decodes the JWT using `jwt-decode` and checks its `exp` (expiration) claim against the current time. This prevents the app from trying to use an expired token.

## 3. Create a Custom Auth Hook

To make accessing authentication state and actions easier in our components, let's create a custom hook `useAuth`.

Create `src/hooks/useAuth.js`:

```jsx
// src/hooks/useAuth.js
import { useAppStore } from '../lib/store'; // Import the store hook

/**
 * Custom Hook: useAuth
 * Provides convenient access to authentication-related state and actions
 * from the Zustand store.
 * Selects only the necessary pieces of state to optimize re-renders.
 * @returns {object} An object containing auth state and actions.
 */
const useAuth = () => {
  // Use the store hook and a selector function to get specific state pieces.
  // This ensures the component only re-renders if these specific pieces change.
  const { 
    isAuthenticated, // boolean: Is the user logged in?
    isInitialized,   // boolean: Has auth check finished on app load?
    currentUser,     // object | null: The logged-in user data
    login,           // function: Action to log in
    logout,          // function: Action to log out
    isLoadingAuth,   // boolean: Is any auth operation in progress?
    errorAuth,       // string | null: Any error message from auth operations
  } = useAppStore(state => ({
    // Selector function maps store state to the hook's return values
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    currentUser: state.currentUser,
    login: state.login,
    logout: state.logout,
    isLoadingAuth: state.isLoading.auth, // Get specific loading state
    errorAuth: state.errors.auth,       // Get specific error state
  }));

  // Return the selected state and actions in a structured object
  return {
    isAuthenticated,
    isInitialized,
    user: currentUser, // Rename currentUser to user for common usage
    login,
    logout,
    // Combine loading/error states for easier consumption in components (optional)
    isLoading: isLoadingAuth,
    error: errorAuth,
    // Booleans for specific states (derived from isLoadingAuth)
    // Note: These might not be perfectly accurate if multiple auth actions run concurrently,
    // but often sufficient for UI feedback.
    isLoggingIn: isLoadingAuth,
    isLoggingOut: isLoadingAuth, // Logout is usually synchronous, but handled for consistency
  };
};

export default useAuth;
```

**Explanation:**

*   This hook acts as a facade over our Zustand store for authentication concerns.
*   It uses `useAppStore` with a *selector function* (`state => ({ ... })`). This is a crucial optimization: components using `useAuth` will only re-render if the specific state properties selected (`isAuthenticated`, `currentUser`, etc.) actually change.
*   It provides a clean interface (`isAuthenticated`, `user`, `login`, `logout`, etc.) for components to use.

## 4. Create a Loading Screen Component

We need a simple component to show while the app is initializing or data is loading.

Create `src/components/LoadingScreen.jsx`:

```jsx
// src/components/LoadingScreen.jsx
import React from "react";
import PropTypes from 'prop-types'; // Import PropTypes

/**
 * Standard loading screen component with a spinner.
 * @param {object} props - Component props.
 * @param {string} [props.message="Loading..."] - Optional message to display.
 * @param {boolean} [props.fullScreen=true] - If true, covers the whole screen absolutely positioned.
 */
function LoadingScreen({ message = "Loading...", fullScreen = true }) {
  const containerClass = fullScreen 
    ? "absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-background/80 z-50" // Added background opacity and z-index
    : "w-full py-8 flex justify-center items-center";

  return (
    <div className={containerClass}>
      {/* Simple CSS spinner */}
      <div 
        className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"
        role="status" // Accessibility: indicate loading status
        aria-live="polite" // Accessibility: announce changes politely
      >
        <span className="sr-only">{message}</span> {/* Screen reader only text */}
      </div>
      {message && <p className="text-lg text-muted-foreground">{message}</p>}
    </div>
  );
}

// Add PropTypes for type checking
LoadingScreen.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default LoadingScreen;
```

## 5. Set Up Protected Routes (Route Guards)

To control access to pages, we need route guards: one for pages only accessible to guests (like Login) and one for pages requiring authentication.

Create `src/routes/GuestRoute.jsx`:

```jsx
// src/routes/GuestRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Route Guard: GuestRoute
 * - Renders children (e.g., Login page) only if the user is NOT authenticated.
 * - Redirects authenticated users to the home page ('/').
 * - Shows a loading screen while authentication is being initialized.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  // Show loading screen until authentication status is determined
  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  // If user is authenticated, redirect them away from guest pages (e.g., login)
  if (isAuthenticated) {
    // Redirect to the home page, replacing the current history entry
    return <Navigate to="/" replace />;
  }
  
  // If initialized and not authenticated, render the intended guest page
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;
```

Create `src/routes/AuthRequire.jsx`:

```jsx
// src/routes/AuthRequire.jsx
import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Route Guard: AuthRequire
 * - Renders children (e.g., Home page) only if the user IS authenticated.
 * - Redirects unauthenticated users to the login page, remembering where they came from.
 * - Shows a loading screen while authentication is being initialized.
 */
function AuthRequire({ children }) {
  const { isInitialized, isAuthenticated } = useAuth();
  const location = useLocation(); // Get current location object

  // Show loading screen until authentication status is determined
  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If user is not authenticated, redirect them to the login page
  if (!isAuthenticated) {
    // `replace`: Replace the current entry in history stack, so back button works correctly.
    // `state={{ from: location }}`: Pass the current location to the login page,
    // so it can redirect back after successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If initialized and authenticated, render the intended protected page
  return children;
}

AuthRequire.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthRequire;
```

**Explanation:**

*   **`isInitialized` Check**: Both guards first check `isInitialized` from `useAuth`. This prevents redirecting before the app knows if a user is logged in (from checking `localStorage`).
*   **`GuestRoute`**: If initialized and `isAuthenticated` is `true`, it redirects to `/`.
*   **`AuthRequire`**: If initialized and `isAuthenticated` is `false`, it redirects to `/login`. It uses `useLocation` and `state={{ from: location }}` to tell the login page where the user intended to go, allowing redirection back after login.

## 6. Create Basic Layouts

Layout components define the overall structure (like headers, footers) for different sections of the app.

Create `src/layouts/BlankLayout.jsx` (for pages like login without main navigation):

```jsx
// src/layouts/BlankLayout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";

/**
 * Blank Layout: Renders only the child route's content.
 * Useful for pages like Login, 404 that don't need the main header/nav.
 */
function BlankLayout() {
  // Outlet renders the matched child route component
  return (
    <main className="min-h-screen flex flex-col">
      <Outlet />
    </main>
  );
}

export default BlankLayout;
```

Create `src/layouts/MainLayout.jsx` (for authenticated pages with header):

```jsx
// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader"; // We'll create this next

/**
 * Main Layout: Includes the main header and renders the child route's content
 * within a container.
 * Used for authenticated sections of the application.
 */
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Outlet renders the matched child route component (e.g., HomePage) */}
        <Outlet /> 
      </main>
      {/* Add a Footer component here later if needed */}
    </div>
  );
}

export default MainLayout;
```

Create `src/layouts/MainHeader.jsx`:

```jsx
// src/layouts/MainHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { LogOut, UserCircle, LayoutDashboard } from "lucide-react"; // Added LayoutDashboard
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

/**
 * Main application header for authenticated users.
 * Displays the logo, navigation links (implicitly via dropdown), and user actions.
 */
function MainHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout action from the store
      navigate("/login"); // Redirect to login page after successful logout
    } catch (error) {
      console.error("Logout failed:", error); 
      // Optionally show an error toast here
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto h-16 flex items-center justify-between space-x-4 sm:space-x-0">
        {/* Logo/Brand Link */}
        <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
          {/* <Command className="h-6 w-6" /> Replace with actual logo if available */}
          <span className="text-xl font-bold">
            CoderComm
          </span>
        </Link>

        {/* Right side: User Menu */}
        {user && ( // Only show dropdown if user is logged in
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Use Avatar for user profile picture */}
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  {/* Fallback initials if image fails or is missing */}
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="w-full cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 {/* Link to home/dashboard - adjust as needed */}
                 <Link to="/" className="w-full cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

export default MainHeader;
```

**Explanation:**

*   **`Outlet`**: This component from `react-router-dom` is crucial. It renders the component corresponding to the matched child route within the layout.
*   **`BlankLayout`**: Simple wrapper, just renders the child route (`<Outlet />`).
*   **`MainLayout`**: Includes `MainHeader` and renders the child route (`<Outlet />`) within a styled container.
*   **`MainHeader`**: Uses the `useAuth` hook to get user info and the `logout` function. Includes a `DropdownMenu` (from ShadCN) triggered by a user `Avatar` for profile and logout actions.

## 7. Set Up Routes

Now we define the application's routes using `react-router-dom` and our route guards.

Create `src/routes/index.jsx`:

```jsx
// src/routes/index.jsx
import React from "react"; // Import React
import { Routes, Route } from "react-router-dom";

// Layouts
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";

// Route Guards
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

// Pages (Lazy load pages for better performance)
// We'll create these page components in the next step
const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
// Add other page imports here as you create them (e.g., AccountPage, UserProfilePage)
// const AccountPage = React.lazy(() => import("../pages/AccountPage")); 

/**
 * Main Router configuration using React Router v6.
 * Defines layouts, route guards, and page components for different paths.
 */
function Router() {
  return (
    // Wrap Routes in React.Suspense to handle lazy loading
    <React.Suspense fallback={<div>Loading page...</div>}> {/* Replace with LoadingScreen later if desired */}
      <Routes>
        {/* --- Protected Routes (Require Authentication) --- */}
        {/* Routes wrapped in AuthRequire need the user to be logged in */}
        {/* These routes use the MainLayout (with header) */}
        <Route
          path="/"
          element={
            <AuthRequire>
              <MainLayout />
            </AuthRequire>
          }
        >
          {/* index route: component rendered at the parent path ('/') */}
          <Route index element={<HomePage />} />
          
          {/* Add other protected routes nested here later */}
          {/* Example: <Route path="account" element={<AccountPage />} /> */}
          {/* Example: <Route path="user/:userId" element={<UserProfilePage />} /> */}
        </Route>

        {/* --- Guest Routes (Require No Authentication) --- */}
        {/* Routes wrapped in GuestRoute are only for non-logged-in users */}
        {/* These routes use the BlankLayout (no header) */}
        <Route element={<BlankLayout />}>
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } 
          />
          
          {/* Add other guest routes like Forgot Password here */}
          
          {/* --- Catch-all Route (404 Not Found) --- */}
          {/* This route matches any path not matched above */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default Router;
```

**Explanation:**

*   **`Routes` and `Route`**: Core components from `react-router-dom` for defining URL paths and their corresponding components.
*   **Layout Nesting**: Routes are nested within layout routes (`<Route element={<MainLayout />}>`). This makes the layout wrap all child routes.
*   **Route Guards**: `AuthRequire` wraps protected routes, and `GuestRoute` wraps guest-only routes.
*   **`index` Route**: Specifies the default component to render at the parent path (`/`).
*   **Lazy Loading**: We use `React.lazy()` and `React.Suspense` to load page components only when they are needed, improving initial load time. The `fallback` in `Suspense` is shown while the component is loading.

## 8. Create Authentication Pages

Now, let's create the actual `LoginPage` components.

Create `src/pages/LoginPage.jsx`:

```jsx
// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

// ShadCN UI Components
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For displaying errors
import { Eye, EyeOff, AlertCircle } from "lucide-react";

// Custom Hook
import useAuth from "@/hooks/useAuth";

/**
 * Yup validation schema for the login form.
 */
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required"),
  remember: Yup.boolean() // Added for remember me checkbox
});

// Default form values
const defaultValues = {
  email: "reactlover@coderschool.vn", // Pre-fill with mock user email for convenience
  password: "password123", // Pre-fill (mock server ignores password)
  remember: true,
};

/**
 * LoginPage Component:
 * - Displays the login form.
 * - Uses React Hook Form for form state management and Yup for validation.
 * - Calls the `login` action from the `useAuth` hook on submission.
 * - Handles loading states and displays errors.
 */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form setup
  const form = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const { setError, formState: { errors: formErrors, isSubmitting } } = form;

  // onSubmit function for the form
  const onSubmit = async (data) => {
    // Determine where to redirect after login
    // If redirected from a protected page, `location.state?.from` will exist.
    const from = location.state?.from?.pathname || "/"; // Default to home page
    let { email, password /*, remember */ } = data; // Extract form data

    try {
      // Call the login action from our auth hook
      await auth.login({ email, password });
      // Navigate to the original intended page or home page
      navigate(from, { replace: true });
    } catch (error) {
      // If login fails (error thrown from auth.login)
      console.error("Login Page Error:", error);
      // Reset form state, keeping email but clearing password
      form.reset({ ...data, password: "" }); 
      // Set a general form error message using react-hook-form's setError
      setError("root", { 
        type: "manual", 
        message: error.message || "An unexpected error occurred during login."
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Welcome back! Enter your credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display general form errors (from setError('root', ...)) */}
          {formErrors.root && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {formErrors.root.message}
              </AlertDescription>
            </Alert>
          )}
          
         
          {/* Login Form using React Hook Form and ShadCN components */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage /> { /* Displays validation errors for this field */}
                  </FormItem>
                )}
              />
              
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password" 
                          {...field} 
                        />
                        {/* Toggle password visibility button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1} // Prevent tabbing to this button
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember" // Should match Yup schema
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">Remember me</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                {/* Forgot password link - functionality not implemented in this tutorial */}
                <RouterLink 
                  to="#" // Link to # for now
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={(e) => e.preventDefault()} // Prevent navigation for now
                >
                  Forgot password?
                </RouterLink>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
```



**Explanation:**

*   **React Hook Form & Yup**: We use `useForm` for form state and `yupResolver` with a Yup schema (`LoginSchema`) for easy validation.
*   **ShadCN UI Components**: We leverage components like `Card`, `Input`, `Button`, `Form`, `FormField`, `Alert` for a consistent UI.
*   **`useAuth` Hook**: The `auth.login()` actions are called within the `onSubmit` handler.
*   **Error Handling**: Errors caught from the `auth` actions are displayed using ShadCN's `Alert` component by setting a root form error with `setError('root', ...)`. We also provide specific feedback if the mock registration fails.
*   **Password Visibility**: State (`showPassword`) is used to toggle password input visibility.

## 9. Create Basic Home and Not Found Pages

We need placeholder pages for the home route (`/`) and a 404 page.

Create `src/pages/HomePage.jsx`:

```jsx
// src/pages/HomePage.jsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen

/**
 * Home page component (Placeholder)
 * Displays a welcome message after authentication.
 */
function HomePage() {
  // Get user and loading state from useAuth
  const { user, isLoading } = useAuth();

  // Show loading state if auth check is still in progress (might be redundant 
  // if AuthRequire already handled it, but safe to keep)
  if (isLoading && !user) { // Check specifically if loading AND user is not yet available
    return <LoadingScreen message="Loading user data..." fullScreen={false} />; // Use non-fullscreen loader here
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name || 'Developer'}!</h1>
      <p className="text-muted-foreground">
        This is your CoderComm home feed. Content coming soon!
      </p>
    </div>
  );
}

export default HomePage;
```

Create `src/pages/NotFoundPage.jsx`:

```jsx
// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

/**
 * Not Found (404) page component.
 * Displayed when a user navigates to a route that doesn't exist.
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen p-6">
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-3xl font-semibold mb-3">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Oops! The page you are looking for doesn't seem to exist. It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Button asChild size="lg">
        <Link to="/">
          <Home className="mr-2 h-5 w-5" />
          Go Back Home
        </Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
```

## 10. Update App Component to Initialize Auth

The main `App` component needs to trigger the authentication initialization when it mounts.

Update `src/App.jsx`:

```jsx
// src/App.jsx
import React, { useEffect } from "react";
import { Toaster } from "sonner"; // For toast notifications
import Router from "./routes"; // Import the router configuration
import { useAppStore } from "@/lib/store"; // Import the store hook directly
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Main App component:
 * - Initializes authentication on mount.
 * - Renders the main Router.
 * - Includes the Toaster component for notifications.
 */
function App() {
  // Get the initialization action and status directly from the store hook
  const { initializeAuth, isInitialized } = useAppStore(state => ({
    initializeAuth: state.initializeAuth,
    isInitialized: state.isInitialized
  }));

  // Run the initializeAuth action only once when the component mounts
  useEffect(() => {
    console.log("App Mounted: Initializing Auth...");
    initializeAuth();
  }, [initializeAuth]); // Dependency array ensures this runs only once

  // Show a full-screen loading indicator until authentication is initialized
  // This prevents rendering the app routes before we know if the user is logged in
  if (!isInitialized) {
    return <LoadingScreen message="Initializing CoderComm..." />;
  }

  // Once initialized, render the Router and Toaster
  return (
    <>
      <Router />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export default App;
```

**Explanation:**

*   We use `useEffect` with an empty dependency array (`[initializeAuth]`) to call `initializeAuth()` only once when the `App` component first mounts.
*   We get `isInitialized` directly from the store and render `LoadingScreen` until it becomes `true`. This ensures the `Router` (and its guards) don't render prematurely.
*   The `Toaster` component from `sonner` is included here to handle notifications globally.

## 11. Understanding Mock API Auth & Login Credentials

Our mock API (`src/mockApi/server.js`) simulates the necessary backend endpoints:

*   `POST /api/auth/login`: Takes email/password, returns user object and a fake token if email matches `reactlover@coderschool.vn` (from `data.js`). **The password check is bypassed in the mock for simplicity.**
*   `POST /api/users`: Simulates user registration. **Currently configured to return an error** to guide learners towards using the login flow.
*   `GET /api/users/me`: Returns the profile data for the currently logged-in mock user (always `user1`).

**Login Details for Testing:**

*   **Email:** `reactlover@coderschool.vn`
*   **Password:** `password123` (or anything, as the mock ignores it)

## 12. Update Main Entry Point (No React Query Yet)

Update `src/main.jsx` to wrap the `App` in the `BrowserRouter`. We are *not* adding `QueryClientProvider` yet; that will come when we implement data fetching features.

```jsx
// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// import { HelmetProvider } from 'react-helmet-async'; // Add if using Helmet for head tags

import App from './App';

// Import Tailwind CSS
import './index.css';

// Conditional Mock Server Initialization (from Step 1)
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  import('./mockApi/server').then(({ mockServer }) => {
    mockServer({ environment: 'development' });
    console.log('🔶 Mock API Server Started (Development Mode)');
  }).catch(error => {
    console.error("Failed to start mock server:", error);
  });
} else if (import.meta.env.VITE_API_URL) {
  console.log(` Bypassing mock server. Using real API at: ${import.meta.env.VITE_API_URL}`);
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    {/* <HelmetProvider> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    {/* </HelmetProvider> */}
  </React.StrictMode>
);
```

## 13. Add Required UI Components

In Step 1, we ran `npx shadcn@latest init`. Now, we need to add the specific components used in this step (Login pages, Header).

Run the following commands in your terminal:

```bash
# Add components used in Login/Header
npx shadcn@latest add button card form input label checkbox alert-dialog avatar dropdown-menu alert
```

*   This command copies the code for these components into your `src/components/ui` directory.
*   Review the components created and ensure they match your project's style configuration.

## 14. Run the Application and Test Login

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` (or your port):

1.  You should be redirected to the `/login` page (because `AuthRequire` fails initially).
2.  Try logging in using:
    *   Email: `reactlover@coderschool.vn`
    *   Password: `password123` (or any password)
3.  You should be redirected to the `/` (Home) page, displaying the welcome message and the main header.
4.  Try refreshing the page – you should remain logged in (thanks to Zustand `persist` and `initializeAuth`).
5.  Use the dropdown menu in the header to log out. You should be redirected back to `/login`.
6.  Try visiting `/` directly while logged out – you should be redirected to `/login`.
7.  Try visiting `/login` while logged in – you should be redirected to `/`.
8.  (Optional) Try the registration form – you should see the "Mock registration is disabled" error.

## 15. Frequently Asked Questions (FAQ)

*   **Q: Why use Zustand for auth instead of just React Context?**
    *   A: While Context *can* work, Zustand offers benefits like easier asynchronous action handling (login), built-in middleware (`persist`), and performance optimizations via selectors, which prevent unnecessary re-renders in components that don't need specific state updates. For a growing app, it scales better.
*   **Q: What's the purpose of the `useAuth` hook? Why not use `useAppStore` directly?**
    *   A: `useAuth` acts as an interface or facade specifically for authentication. It selects only the auth-related state and actions, making components cleaner and less coupled to the entire store structure. It also helps optimize re-renders because components only subscribe to the state selected within the hook.
*   **Q: What are Axios interceptors doing in `apiService.js`?**
    *   A: Interceptors let us globally modify requests before they're sent (e.g., adding the `Authorization` header) and responses after they arrive (e.g., standardizing error handling). This avoids repeating this logic in every API call.
*   **Q: Why do we need `isValidToken` on the frontend? Shouldn't the backend handle this?**
    *   A: Yes, the backend *must* always validate the token. The frontend check (`isValidToken`) is a quick client-side optimization. It prevents the app from attempting API calls with an obviously expired token, improving perceived performance and avoiding unnecessary network requests that would fail anyway.
*   **Q: How do `AuthRequire` and `GuestRoute` work?**
    *   A: They are "route guards". They use the `useAuth` hook to check `isInitialized` and `isAuthenticated`. Based on these values, they either render their `children` (the actual page component) or use `<Navigate>` from `react-router-dom` to redirect the user elsewhere (e.g., to `/login` or `/`).
*   **Q: What are React Hook Form and Yup doing?**
    *   A: `react-hook-form` manages form state (input values, submission status, errors) efficiently. `yup` defines validation rules (schemas) declaratively (e.g., `string().email().required()`). Using `yupResolver` connects Yup schemas to React Hook Form for automatic validation.

## What's Next?

Congratulations! You have a working authentication system with login, logout, state management, and protected routes. 

In the **Step 3: Main Layout and Navigation**, we'll enhance the main layout, potentially add more navigation elements, and ensure the UI is responsive. 