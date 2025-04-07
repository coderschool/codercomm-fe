# Step 2: Authentication System

In this step, we'll implement the authentication system for our CoderComm application. We'll create the login page, set up state management with Zustand, refine the API service, and add protected routes to control access.

## 1. Set Up the Auth Store (Zustand)

First, let's refine our global state store using Zustand (`src/lib/store.js`). This store will hold authentication status, user information, and related actions. We'll simplify the initialization logic.

Update `src/lib/store.js`:

```jsx
// src/lib/store.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import apiService from './apiService'; // We'll create this next

/**
 * Helper function: Set or remove the authentication token in localStorage
 * and update the default Authorization header for apiService.
 * @param {string | null} accessToken - The JWT token or null to clear.
 */
const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    console.log("Session Token Set"); // Added log
  } else {
    localStorage.removeItem('accessToken');
    delete apiService.defaults.headers.common.Authorization;
    console.log("Session Token Cleared"); // Added log
  }
};

/**
 * Main application state store using Zustand.
 */
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // --- State Properties ---
        currentUser: null,      // Holds the logged-in user object
        isAuthenticated: false, // Is the user confirmed logged in?
        isInitialized: false,   // Has the initial auth check completed?

        // Basic loading/error state for auth operations
        isLoadingAuth: false,
        errorAuth: null,

        // --- Actions (Functions to modify state) ---

        // Auth Actions
        initializeAuth: async () => {
          // This action runs when the app starts
          set({ isInitialized: false, isLoadingAuth: true, errorAuth: null }); // Reset before check
          const accessToken = localStorage.getItem('accessToken');

          if (!accessToken) {
            set({ isAuthenticated: false, isInitialized: true, isLoadingAuth: false, currentUser: null });
            setSession(null); // Ensure headers are clear if no token
            console.log("Auth Initialized: No Token Found");
            return;
          }

          // If token exists, set it for the upcoming API call
          setSession(accessToken);

          try {
            // Attempt to fetch the current user data using the token
            const response = await apiService.get('/users/me');
            const user = response.data; // The mock server returns the user object directly

            set({
              currentUser: user,
              isAuthenticated: true,
              isInitialized: true,
              isLoadingAuth: false,
              errorAuth: null,
            });
            console.log("Auth Initialized: User Verified", user);
          } catch (error) {
            // If /users/me fails (invalid token, network error), treat as logged out
            console.error("Auth Initialization Error (Likely Invalid Token):", error);
            setSession(null); // Clear invalid token
            set({
              currentUser: null,
              isAuthenticated: false,
              isInitialized: true, // Still initialized, just not authenticated
              isLoadingAuth: false,
              errorAuth: error.message || 'Authentication failed', // Store the error
            });
          }
        },

        login: async (credentials) => {
          set({ isLoadingAuth: true, errorAuth: null });
          try {
            const response = await apiService.post('/auth/login', credentials);
            // The mock API returns { user, accessToken } directly in response.data
            const { user, accessToken } = response.data;

            setSession(accessToken); // Store token and set header

            set({
              currentUser: user,
              isAuthenticated: true,
              isLoadingAuth: false,
              errorAuth: null,
            });

            toast.success('Login successful');
            return user;
          } catch (error) {
            console.error("Login Error:", error);
            const errorMessage = error.message || 'Login failed. Please check credentials.';
            set({
              isLoadingAuth: false,
              errorAuth: errorMessage,
              isAuthenticated: false, // Ensure auth state is false on login failure
              currentUser: null,
            });
            toast.error(errorMessage);
            throw new Error(errorMessage); // Re-throw simplified error message
          }
        },

        logout: () => {
          setSession(null); // Clear token and header
          set({
            currentUser: null,
            isAuthenticated: false,
            errorAuth: null, // Clear any previous auth errors
            // Don't reset isInitialized here
          });
          toast.success('Logged out successfully');
          console.log("User Logged Out");
        },

        // Clear specific auth error (e.g., after displaying it)
        clearAuthError: () => set({ errorAuth: null }),

      }),
      // Configuration object for the `persist` middleware
      {
        name: 'codercomm-storage', // Name of the item in localStorage
        // Only persist the user object. isAuthenticated will be derived by initializeAuth.
        partialize: (state) => ({
          // We intentionally DO NOT persist isAuthenticated or isInitialized.
          // initializeAuth will determine these based on token validity on app load.
          // We also don't persist loading/error states.
          // Only currentUser *might* be useful to persist for faster initial display,
          // but it will be overwritten by initializeAuth anyway.
          // Let's not persist anything for now to rely purely on initializeAuth.
          // If we wanted to persist the user:
          // currentUser: state.currentUser
        }),
        onRehydrateStorage: (state) => {
          console.log("Zustand: Hydration from localStorage finished.")
          // We could potentially trigger initializeAuth here if needed,
          // but App.jsx handles it on mount.
        }
      }
    )
  )
);

export const useAppStore = useStore; // Export the hook
```

**Explanation of Changes:**

*   **Simplified `initializeAuth`**: Removed the `isValidToken` check. Now, it checks for a token in `localStorage`. If found, it sets the `Authorization` header and tries to fetch `/users/me`. If the API call succeeds, the user is authenticated. If it fails (e.g., token expired/invalid, network error), the user is considered logged out, and the session is cleared. This relies on the API as the source of truth for token validity.
*   **Simplified `persist`**: We are no longer persisting `isAuthenticated` or `currentUser`. The `initializeAuth` function running on app load is solely responsible for determining the auth state based on the token and the `/users/me` endpoint. This makes the initialization logic cleaner.
*   **State Properties**: Kept `currentUser`, `isAuthenticated`, `isInitialized`. Added simple `isLoadingAuth` and `errorAuth` for feedback during login/initialization.
*   **Logging**: Added console logs to `setSession` and `initializeAuth` steps for better debugging during the tutorial.
*   **Error Handling**: Improved error message extraction and propagation in `login`. Added `clearAuthError` action.

## 2. Create API Service

Let's ensure our Axios instance (`apiService`) is set up correctly. We removed the JWT utility in the previous step, so we just need the basic Axios setup with interceptors.

Create `src/lib/apiService.js` (or verify if it exists from Step 1):

```jsx
// src/lib/apiService.js
import axios from "axios";
import { useAppStore } from './store'; // Import store for potential use in interceptors

// --- Configuration ---
const baseURL = import.meta.env.VITE_API_URL || '/api';
console.log(` API Base URL: ${baseURL}`);

// --- Create Axios Instance ---
const apiService = axios.create({ baseURL });

// --- Interceptors ---

// Request Interceptor:
// Automatically adds the Authorization header from localStorage if it exists.
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Request Interceptor: Token Added");
    } else {
      // Ensure Authorization header is removed if no token exists
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.error("Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor:
// - Returns response.data for successful responses.
// - Standardizes error handling.
// - Handles potential 401 Unauthorized errors globally.
apiService.interceptors.response.use(
  (response) => {
    // For successful responses (2xx), return the data part directly
    return response.data; // Simplified: return data directly
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle 401 Unauthorized specifically (e.g., invalid token)
    if (error.response && error.response.status === 401) {
      console.log("API Interceptor: Received 401 Unauthorized. Logging out.");
      // Access Zustand logout action directly
      // Note: This creates a dependency cycle if apiService is imported in store.js
      // A better approach might be event emitters or handling 401 in initializeAuth/components.
      // For simplicity in this tutorial, we'll call it here, but be aware.
      // --> Let's actually avoid calling logout here to prevent cycles.
      // --> The `initializeAuth` logic and component-level catches should handle this.
      // useAppStore.getState().logout(); // Avoid this direct call here
      
      // Clear potentially invalid token from local storage
      localStorage.removeItem('accessToken'); 
      // Maybe reload the page to force re-initialization and redirection?
      // window.location.reload(); // Or navigate programmatically if router is available
    }

    // Try to extract a meaningful error message
    const message =
      error.response?.data?.message || // Backend standard error message
      error.message || // Network error or other Axios error
      "An unexpected API error occurred";

    // Reject with a simplified error object containing the message
    // Components calling the apiService should catch this error.
    return Promise.reject({ message });
  }
);

export default apiService;
```

**Explanation:**

*   **No JWT Util:** This file no longer imports or relies on `jwt.js` or `jwt-decode`.
*   **Request Interceptor:** Still adds the token from `localStorage` if present. Added logic to explicitly delete the header if no token exists, ensuring clean requests.
*   **Response Interceptor:** Now directly returns `response.data` on success. The error handling extracts the message. **Crucially, the automatic global logout on 401 has been commented out** to avoid potential complexity and dependency cycles in this tutorial setup. We will rely on the `initializeAuth` check on page load and error catching within components (like the login page) to handle auth failures.

## 3. Create a Loading Screen Component

We need a simple component to show while the app is initializing or data is loading. (This remains the same as the previous version, just renumbered).

Create `src/components/LoadingScreen.jsx` if you haven't already:

```jsx
// src/components/LoadingScreen.jsx
import React from "react";
import PropTypes from 'prop-types';

/**
 * Standard loading screen component with a spinner.
 * @param {object} props - Component props.
 * @param {string} [props.message="Loading..."] - Optional message to display.
 * @param {boolean} [props.fullScreen=true] - If true, covers the whole screen.
 */
function LoadingScreen({ message = "Loading...", fullScreen = true }) {
  const containerClass = fullScreen
    ? "absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-background/80 z-50"
    : "w-full py-8 flex flex-col justify-center items-center"; // Added flex-col

  return (
    <div className={containerClass}>
      <div
        className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">{message}</span>
      </div>
      {message && <p className="text-lg text-muted-foreground">{message}</p>}
    </div>
  );
}

LoadingScreen.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default LoadingScreen;
```

## 4. Set Up Protected Routes (Route Guards)

To control access to pages, we need route guards. These will now directly use the `useAppStore` hook to check the authentication state.

Update `src/routes/GuestRoute.jsx`:

```jsx
// src/routes/GuestRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAppStore } from '@/lib/store'; // Import useAppStore
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Route Guard: GuestRoute
 * - Renders children only if the user is NOT authenticated.
 * - Redirects authenticated users to the home page ('/').
 * - Shows a loading screen while authentication is being initialized.
 */
function GuestRoute({ children }) {
  // Use selector to get only needed state from the store
  const { isAuthenticated, isInitialized } = useAppStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
  }));

  if (!isInitialized) {
    return <LoadingScreen message="Verifying session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;
```

Update `src/routes/AuthRequire.jsx`:

```jsx
// src/routes/AuthRequire.jsx
import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import { useAppStore } from "@/lib/store"; // Import useAppStore
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Route Guard: AuthRequire
 * - Renders children only if the user IS authenticated.
 * - Redirects unauthenticated users to the login page.
 * - Shows a loading screen while authentication is being initialized.
 */
function AuthRequire({ children }) {
  const location = useLocation();
  // Use selector to get only needed state from the store
  const { isAuthenticated, isInitialized } = useAppStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
  }));

  if (!isInitialized) {
    return <LoadingScreen message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    console.log("AuthRequire: Not authenticated, redirecting to login.");
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

**Explanation of Changes:**

*   Both `GuestRoute` and `AuthRequire` now import `useAppStore` directly.
*   They use a selector function (`state => ({ ... })`) with `useAppStore` to subscribe *only* to the `isAuthenticated` and `isInitialized` state variables. This optimizes performance, preventing re-renders if other parts of the store change.

## 5. Create Basic Layouts

Layout components define the overall structure. These remain largely the same, but we need to update `MainHeader` to use the store hook directly.

Create `src/layouts/BlankLayout.jsx` (if not already present):

```jsx
// src/layouts/BlankLayout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";

function BlankLayout() {
  return (
    <main className="min-h-screen flex flex-col">
      <Outlet />
    </main>
  );
}
export default BlankLayout;
```

Create `src/layouts/MainLayout.jsx` (if not already present):

```jsx
// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader"; // We'll update this next

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      {/* Add Footer later if needed */}
    </div>
  );
}
export default MainLayout;
```

Update `src/layouts/MainHeader.jsx`:

```jsx
// src/layouts/MainHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store"; // Import useAppStore
import { LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Main application header for authenticated users.
 * Now uses useAppStore directly.
 */
function MainHeader() {
  const navigate = useNavigate();
  // Get user and logout action directly from the store
  const { user, logout } = useAppStore(state => ({
    user: state.currentUser,
    logout: state.logout,
  }));

  const handleLogout = () => {
    logout(); // Call the logout action from the store
    navigate("/login", { replace: true }); // Redirect to login page
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto h-16 flex items-center justify-between space-x-4 sm:space-x-0">
        <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
          {/* <Command className="h-6 w-6" /> Replace with logo */}
          <span className="text-xl font-bold">CoderComm</span>
        </Link>

        {/* Right side: User Menu - Only show if user object exists */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt={user.name || 'User Avatar'} />
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'Username'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Simplified: Link to profile page (we'll create later) */}
              <DropdownMenuItem asChild>
                <Link to={`/user/${user._id}`} className="w-full cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
               {/* Link to home/dashboard */}
              <DropdownMenuItem asChild>
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
        ) : (
          // Optionally show a Login button if not authenticated (though usually header isn't shown)
          <Button asChild variant="outline">
             <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

export default MainHeader;
```

**Explanation of Changes:**

*   `MainHeader.jsx` now imports `useAppStore`.
*   It uses a selector `state => ({ user: state.currentUser, logout: state.logout })` to get the user data and logout action.
*   The conditional rendering `user ? (...) : (...)` ensures the dropdown only appears if `currentUser` is not null.
*   Updated the "Profile" link to point to `/user/:userId` (using the actual user ID) which we will handle in a later step.

## 6. Set Up Routes

Now we define the application's routes using `react-router-dom` and our updated route guards. This structure remains the same, just ensure the imports are correct.

Create `src/routes/index.jsx` (or verify):

```jsx
// src/routes/index.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen

// Layouts
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";

// Route Guards
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

// Pages (Lazy load pages)
// Define placeholders - we create these next
const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
// const UserProfilePage = React.lazy(() => import("../pages/UserProfilePage")); // For later

/**
 * Main Router configuration.
 */
function Router() {
  return (
    // Suspense handles the lazy loading of page components
    <React.Suspense fallback={<LoadingScreen message="Loading page..." />}>
      <Routes>
        {/* --- Protected Routes (Require Authentication) --- */}
        <Route
          path="/"
          element={
            <AuthRequire>
              <MainLayout />
            </AuthRequire>
          }
        >
          {/* Default route at '/' */}
          <Route index element={<HomePage />} />

          {/* Placeholder for user profile route */}
          {/* <Route path="user/:userId" element={<UserProfilePage />} /> */}

          {/* Add other protected routes here */}
        </Route>

        {/* --- Guest Routes (Require No Authentication) --- */}
        <Route element={<BlankLayout />}>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          {/* Add registration, forgot password routes here if needed */}

          {/* --- Catch-all Route (404 Not Found) --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default Router;
```

**Explanation:**

*   No major changes here, just ensuring lazy loading and route guards are correctly imported and used.
*   Added a placeholder comment for the user profile route.

## 7. Create Authentication Page (Login)

Now, let's create the `LoginPage` component, updating it to use `useAppStore` directly.

Create `src/pages/LoginPage.jsx`:

```jsx
// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAppStore } from "@/lib/store"; // Import useAppStore

// ShadCN UI Components
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox"; // Removed 'Remember Me' for simplicity
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

// Validation Schema (Simplified - no remember me)
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

// Default form values
const defaultValues = {
  email: "reactlover@coderschool.vn", // Mock user email
  password: "password123", // Mock password (ignored by server)
};

/**
 * LoginPage Component: Updated to use useAppStore directly.
 */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // Get actions and state from Zustand store
  const { login, isLoadingAuth, errorAuth, clearAuthError } = useAppStore(state => ({
    login: state.login,
    isLoadingAuth: state.isLoadingAuth,
    errorAuth: state.errorAuth,
    clearAuthError: state.clearAuthError,
  }));

  // React Hook Form setup
  const form = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const { handleSubmit, setError, reset, formState: { errors: formErrors } } = form;

  // Clear previous auth errors when component mounts or error changes
  useEffect(() => {
    return () => {
      clearAuthError(); // Clear error when component unmounts
    };
  }, [clearAuthError]);

  // Form submission handler
  const onSubmit = async (data) => {
    clearAuthError(); // Clear previous errors before attempting login
    const from = location.state?.from?.pathname || "/"; // Redirect path
    try {
      await login(data); // Call the login action from store
      navigate(from, { replace: true }); // Redirect on success
    } catch (error) {
      // Error is already handled and stored in errorAuth by the login action
      // We can optionally reset parts of the form here if needed
      console.error("Login Page Submit Error:", error.message); // Log the error passed from the action
       reset({ email: data.email, password: "" }); // Keep email, clear password
       // The Alert component below will display errorAuth from the store
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Welcome back! Use `reactlover@coderschool.vn`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display general form error from Zustand store */}
          {errorAuth && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {errorAuth} {/* Display error message from store */}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoadingAuth} />
                    </FormControl>
                    <FormMessage /> {/* Displays RHF validation errors */}
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
                          disabled={isLoadingAuth}
                        />
                        <Button
                          type="button" variant="ghost" size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1} disabled={isLoadingAuth}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide" : "Show"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Removed Remember Me / Forgot Password for simplicity */}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoadingAuth}>
                {isLoadingAuth ? "Logging in..." : "Login"}
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

**Explanation of Changes:**

*   **`useAppStore`**: Imports and uses the store hook directly with a selector to get `login`, `isLoadingAuth`, `errorAuth`, and `clearAuthError`.
*   **Error Handling**: The `onSubmit` function now relies on the `login` action itself to set the `errorAuth` state in Zustand. The `Alert` component directly reads `errorAuth` from the store. A `useEffect` hook is added to clear the error when the component unmounts.
*   **Loading State**: The `isLoadingAuth` state from the store is used to disable form inputs and show loading text on the button.
*   **Simplified**: Removed the "Remember Me" checkbox and "Forgot Password" link to keep the example focused.

## 8. Create Basic Home and Not Found Pages

We need placeholder pages for the home route (`/`) and a 404 page. `HomePage` also needs to use the store hook.

Update `src/pages/HomePage.jsx`:

```jsx
// src/pages/HomePage.jsx
import React from "react";
import { useAppStore } from "@/lib/store"; // Import useAppStore
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Home page component (Placeholder)
 * Displays a welcome message after authentication.
 */
function HomePage() {
  // Get user directly from the store
  const { user } = useAppStore(state => ({
    user: state.currentUser,
  }));

  // The AuthRequire guard should handle the main loading state before rendering this page.
  // However, if user data fetching within AuthRequire/initializeAuth is slow AFTER initial auth,
  // the user object might briefly be null. We can show a simple inline loading or just the welcome message.
  if (!user) {
     // Optional: Show a smaller loading indicator if user data isn't immediately ready
     // return <LoadingScreen message="Loading user details..." fullScreen={false} />;
     // Or just return null/basic message until user is populated
     return (
       <div className="max-w-3xl mx-auto text-center py-10">
         <p className="text-muted-foreground">Loading user data...</p>
       </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto"> {/* Increased max-width */}
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1> {/* Larger heading */}
      
      {/* Placeholder for where the main content (like Post Feed) will go */}
      <div className="bg-card border rounded-lg p-6 text-center">
         <p className="text-lg text-muted-foreground">
            Your CoderComm feed will appear here soon.
          </p>
         {/* We will add PostForm and PostList components here in later steps */}
      </div>

       {/* Temporary display of user data for verification */}
       <div className="mt-8 p-4 border rounded bg-secondary/50">
          <h3 className="font-semibold mb-2">User Data (from Zustand):</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
       </div>
    </div>
  );
}

export default HomePage;
```

Create `src/pages/NotFoundPage.jsx` (if not already present, same as before):

```jsx
// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen p-6">
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-3xl font-semibold mb-3">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Oops! The page you are looking for doesn't seem to exist.
      </p>
      <Button asChild size="lg">
        <Link to="/">
          <Home className="mr-2 h-5 w-5" /> Go Back Home
        </Link>
      </Button>
    </div>
  );
}
export default NotFoundPage;
```

**Explanation of Changes:**

*   `HomePage.jsx` now imports `useAppStore` and gets the `user` object directly.
*   Added a simple check for `!user` to handle the brief moment before `currentUser` might be populated after initialization.
*   Added a temporary display block to show the raw user data from the store for verification during the tutorial.

## 9. Update App Component to Initialize Auth

The main `App` component needs to trigger the authentication initialization and render the router.

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
 * - Initializes authentication on mount using Zustand action.
 * - Renders LoadingScreen until initialization is complete.
 * - Renders the main Router.
 * - Includes the Toaster component for notifications.
 */
function App() {
  // Get the initialization action and status directly from the store hook
  const { initializeAuth, isInitialized } = useAppStore(state => ({
    initializeAuth: state.initializeAuth,
    isInitialized: state.isInitialized,
  }));

  // Run the initializeAuth action only once when the component mounts
  useEffect(() => {
    // Check if already initialized to prevent multiple calls if StrictMode re-mounts
    if (!isInitialized) {
      console.log("App Mounted: Initializing Auth...");
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]); // Dependency array includes isInitialized

  // Show a full-screen loading indicator until authentication is initialized
  if (!isInitialized) {
    return <LoadingScreen message="Initializing CoderComm..." />;
  }

  // Once initialized, render the Router and Toaster
  return (
    <>
      <Router />
      <Toaster position="bottom-right" richColors closeButton duration={3000} />
    </>
  );
}

export default App;
```

**Explanation of Changes:**

*   Now imports `useAppStore` directly.
*   The `useEffect` hook calls `initializeAuth()`. Added `isInitialized` to the dependency array to potentially prevent re-running if React's StrictMode causes a re-mount after initialization (though the check inside helps).
*   Renders `LoadingScreen` based on `isInitialized` from the store.
*   Includes the `Toaster` component.

## 10. Update Main Entry Point

Ensure `src/main.jsx` wraps the `App` in the `BrowserRouter`.

Update `src/main.jsx` (or verify):

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'; // Use .jsx extension
import './index.css';
import { mockServer } from './mockApi/server'; // Assuming path is correct

// Conditional Mock Server Initialization
// Ensure NODE_ENV is accessible or use import.meta.env.DEV
if (import.meta.env.DEV) { // Vite uses import.meta.env.DEV
  // Check if VITE_API_URL is set (to bypass mock server)
  if (!import.meta.env.VITE_API_URL) {
    mockServer({ environment: 'development' });
    console.log('🔶 Mock API Server Started (Development Mode)');
  } else {
     console.log(` Bypassing mock server. Using real API at: ${import.meta.env.VITE_API_URL}`);
  }
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // Use createRoot

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**Explanation of Changes:**

*   Updated imports for `react-dom/client`.
*   Used `import.meta.env.DEV` which is standard in Vite.
*   Ensures `BrowserRouter` wraps the `App`.

## 11. Add Required UI Components

Make sure you have installed the necessary ShadCN UI components.

Run the following command again if you missed any or want to ensure they are up-to-date (it's safe to run multiple times):

```bash
# Components for Login, Header, Alerts etc.
npx shadcn-ui@latest add button card form input label alert avatar dropdown-menu
```
*(Note: Removed `checkbox`, `alert-dialog` as they aren't used in the simplified login)*

## 12. Run the Application and Test Login

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` (or your port):

1.  You should see the "Initializing CoderComm..." loading screen briefly.
2.  You should then be redirected to the `/login` page (because `AuthRequire` fails as you aren't logged in).
3.  Try logging in using:
    *   Email: `reactlover@coderschool.vn`
    *   Password: `password123` (or any password)
4.  You should see a "Login successful" toast notification.
5.  You should be redirected to the `/` (Home) page, displaying the welcome message and the main header with your avatar/name. Check the temporary user data display.
6.  Try refreshing the page – you should remain logged in. The app will show the "Initializing..." screen, then the `HomePage`.
7.  Use the dropdown menu in the header to log out. You should see a "Logged out" toast and be redirected back to `/login`.
8.  Try visiting `/` directly while logged out – you should be redirected to `/login`.
9.  Try visiting `/login` while logged in – you should be redirected to `/`.
10. Try logging in with incorrect credentials (e.g., wrong email) - you should see a "Login Failed" alert on the form.

## 13. Frequently Asked Questions (FAQ)

*   **Q: Why use Zustand for auth state?**
    *   A: Zustand provides a simple API for managing global state, handles asynchronous actions cleanly (like `login`, `initializeAuth`), integrates well with React DevTools, and offers performance optimizations through selective state subscriptions (`useAppStore(state => ...)`), preventing unnecessary component re-renders.
*   **Q: Why did we remove the `useAuth` hook?**
    *   A: For simplification in this tutorial. Directly using `useAppStore` with selectors in components that need auth state (`isAuthenticated`, `user`, `login`, `logout`) is clear and avoids an extra layer of abstraction. In larger apps, custom hooks like `useAuth` can still be beneficial for encapsulation.
*   **Q: Why don't we check the JWT token validity (`isValidToken`) on the frontend anymore?**
    *   A: To simplify and rely on the API as the single source of truth. The `initializeAuth` function now attempts to fetch `/users/me`. If the token stored in `localStorage` is valid, the API call succeeds, and the user is authenticated. If the token is invalid/expired, the API call fails (likely with a 401 error), and the frontend treats the user as logged out, clearing the invalid token. This avoids client-side decoding and potential clock skew issues.
*   **Q: How do `AuthRequire` and `GuestRoute` work now?**
    *   A: They work similarly but now use `useAppStore` directly with a selector function (`state => ({ isAuthenticated: state.isAuthenticated, isInitialized: state.isInitialized })`) to get the auth status. Based on these values, they either render their `children` or use `<Navigate>` to redirect.
*   **Q: What are React Hook Form and Yup doing?**
    *   A: `react-hook-form` manages form state (input values, submission status, validation errors). `yup` defines validation rules (schemas). `yupResolver` connects them for automatic validation displayed via `<FormMessage />`.

## What's Next?

Congratulations! You have a working authentication system using Zustand directly for state management, along with protected routes.

In **Step 3: Main Layout and Navigation**, we'll focus on building out the structure of the main application view within the `MainLayout`, likely introducing tab-based navigation as mentioned in the project goals. 