# Step 2: Authentication System

In this step, we'll implement the authentication system for our CoderComm application. We'll create login and registration pages, set up state management with Zustand, and add protected routes.

## 1. Set Up the Auth Store

First, let's create a file for our Zustand store. Create a new file in `src/lib/store.js`:

```jsx
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
        
        // Loading and error states
        isLoading: {
          auth: false,
          user: false,
        },
        errors: {
          auth: null,
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
```

## 2. Create API Service and Utilities

Let's create a file for our API service. Create a new file in `src/lib/apiService.js`:

```jsx
import axios from "axios";

// Initialize with token from localStorage if it exists
const token = localStorage.getItem("accessToken");
const initialHeaders = {
  "Content-Type": "application/json",
};

if (token) {
  initialHeaders.Authorization = `Bearer ${token}`;
}

// Determine if we're using the mock API server
const usingMockApi = !import.meta.env.VITE_API_URL;

// Set the base URL - if using mock API, we need to include the /api prefix
const baseURL = usingMockApi 
  ? '/api' // Mock server has a namespace 'api'
  : import.meta.env.VITE_API_URL || '';

const apiService = axios.create({
  baseURL,
  headers: initialHeaders,
});

apiService.interceptors.request.use(
  (request) => {
    console.log("Starting Request", { 
      url: request.url, 
      method: request.method,
      baseURL: request.baseURL,
      fullURL: request.baseURL + request.url
    });
    return request;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    console.log("Response:", { 
      url: response.config.url, 
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error("Response Error:", error);
    const message = error.response?.data?.errors?.message || 
                   error.response?.data?.message || 
                   "Something went wrong";
    return Promise.reject({ message });
  }
);

export default apiService;
```

Create a utility file for JWT token validation in `src/utils/jwt.js`:

```jsx
import { jwtDecode } from 'jwt-decode';

/**
 * Check if a token is valid
 * @param {string} accessToken - JWT token to validate
 * @returns {boolean} - Whether the token is valid
 */
export const isValidToken = (accessToken) => {
  if (!accessToken) return false;
  
  try {
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};
```

## 3. Create a Custom Auth Hook

Create a custom hook to access auth functionality in `src/hooks/useAuth.js`:

```jsx
import useStore from '../lib/store';

/**
 * Hook to access authentication state and actions
 * @returns {Object} Auth state and actions
 * - isAuthenticated: Boolean indicating if user is logged in
 * - isInitialized: Boolean indicating if auth is initialized
 * - user: Current user object or null
 * - login: Function to log in
 * - register: Function to register
 * - logout: Function to log out
 * - isLoggingIn: Boolean indicating if login is in progress
 */
const useAuth = () => {
  const { 
    isAuthenticated,
    isInitialized, 
    currentUser, 
    login, 
    register, 
    logout,
    isLoading,
  } = useStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    currentUser: state.currentUser,
    login: state.login,
    register: state.register,
    logout: state.logout,
    isLoading: state.isLoading.auth,
  }));

  return {
    isAuthenticated,
    isInitialized,
    user: currentUser,
    login,
    register,
    logout,
    isLoggingIn: isLoading,
    isRegistering: isLoading,
    isLoggingOut: isLoading,
  };
};

export default useAuth;
```

## 4. Create a Loading Screen Component

Create a loading screen component in `src/components/LoadingScreen.jsx`:

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

## 5. Set Up Protected Routes

Create route wrappers for guest and authenticated users:

In `src/routes/GuestRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Route wrapper for guest-only pages (login/register)
 * Redirects to home if user is already authenticated
 */
function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default GuestRoute;
```

In `src/routes/AuthRequire.jsx`:

```jsx
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Route wrapper for protected routes
 * Redirects to login if user is not authenticated
 */
function AuthRequire({ children }) {
  const { isInitialized, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AuthRequire;
```

## 6. Create Basic Layouts

Create layout components for different parts of the app:

In `src/layouts/BlankLayout.jsx`:

```jsx
import { Outlet } from "react-router-dom";

/**
 * Blank layout for authentication pages
 * Shows content without navigation
 */
function BlankLayout() {
  return <Outlet />;
}

export default BlankLayout;
```

In `src/layouts/MainLayout.jsx`:

```jsx
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";

/**
 * Main layout for authenticated pages
 * Shows header and content
 */
function MainLayout() {
  return (
    <>
      <MainHeader />
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;
```

In `src/layouts/MainHeader.jsx`:

```jsx
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Main header component with navigation
 */
function MainHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          CoderComm
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
              <UserCircle className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/account" className="w-full cursor-pointer">
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default MainHeader;
```

## 7. Set Up Routes

Create the main router file in `src/routes/index.jsx`:

```jsx
import * as React from "react";
import { Routes, Route } from "react-router-dom";
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

/**
 * Main Router configuration
 */
function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRequire>
            <MainLayout />
          </AuthRequire>
        }
      >
        <Route index element={<HomePage />} />
      </Route>

      <Route element={<BlankLayout />}>
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default Router;
```

## 8. Create Authentication Pages

Create the login page in `src/pages/LoginPage.jsx`:

```jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "@/hooks/useAuth";

/**
 * LoginPage - User login page component
 * Handles user authentication with email and password
 */
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  remember: Yup.boolean()
});

const defaultValues = {
  email: "",
  password: "",
  remember: true,
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const [error, setErrorMsg] = useState("");
  
  const onSubmit = async (data) => {
    const from = location.state?.from?.pathname || "/";
    let { email, password } = data;

    try {
      await auth.login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      form.reset({ ...data, password: "" });
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md mb-6">
            Don't have an account?{" "}
            <RouterLink to="/register" className="font-medium underline">
              Get started
            </RouterLink>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <RouterLink 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </RouterLink>
              </div>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
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

Create the registration page in `src/pages/RegisterPage.jsx`:

```jsx
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "@/hooks/useAuth";

/**
 * RegisterPage - User registration page component
 * Handles creation of new user accounts
 */
const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  passwordConfirmation: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

const defaultValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const form = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const [error, setErrorMsg] = useState("");
  
  const onSubmit = async (data) => {
    const from = location.state?.from?.pathname || "/";
    const { name, email, password } = data;

    try {
      await auth.register({ name, email, password });
      navigate(from, { replace: true });
    } catch (error) {
      form.reset({ ...data, password: "", passwordConfirmation: "" });
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Register to start using CoderComm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md mb-6">
            Already have an account?{" "}
            <RouterLink to="/login" className="font-medium underline">
              Sign in
            </RouterLink>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                          placeholder="Create a password" 
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPasswordConfirmation ? "text" : "password"}
                          placeholder="Confirm your password" 
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showPasswordConfirmation ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-6" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
```

## 9. Create a Basic Home Page

Create a very simple home page in `src/pages/HomePage.jsx`:

```jsx
import React from "react";
import useAuth from "@/hooks/useAuth";

/**
 * Home page component
 * Displays the main feed after authentication
 */
function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground">
        This is your home feed. In the next steps, we'll implement post creation and feed functionality.
      </p>
    </div>
  );
}

export default HomePage;
```

Create a 404 page in `src/pages/NotFoundPage.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Not found (404) page component
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
```

## 10. Update App Component to Initialize Auth

Update your `src/App.jsx` file to initialize authentication:

```jsx
import React, { useEffect } from "react";
import { Toaster } from "sonner";
import Router from "./routes";
import useStore from "@/lib/store";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Main App component
 */
function App() {
  const { initializeAuth, isInitialized } = useStore(state => ({
    initializeAuth: state.initializeAuth,
    isInitialized: state.isInitialized
  }));

  useEffect(() => {
    // Initialize authentication on app mount
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while auth is initializing
  if (!isInitialized) {
    return <LoadingScreen message="Initializing application..." />;
  }

  return (
    <>
      <Router />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
```

## 11. Understanding the Mock API Authentication Endpoints

Our mock API already includes all the endpoints we need for authentication. For this step, we'll be using the following endpoints:

- `POST /api/auth/login` - Authenticate a user with email and password
- `POST /api/users` - Register a new user
- `GET /api/users/me` - Get the current authenticated user's profile

Remember that you don't need to modify the mock API - it's already set up with all the functionality we need. We just need to create the frontend components to interact with these endpoints.

For reference, here are the mock users available for testing:

```jsx
// Mock users (already in the mock API)
{
  _id: "user1",
  name: "John Doe",
  email: "john.doe@example.com", // Use this email with password: password123
  password: "password123",
  avatarUrl: "https://i.pravatar.cc/150?img=1",
  coverUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6",
  aboutMe: "Full-stack developer with a passion for creating beautiful, responsive web applications.",
  postCount: 5,
  friendCount: 8,
}
```

## 12. Update Main Entry Point

Update your `src/main.jsx` file to include React Query and other providers:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import { mockServer } from './mockApi/server';

// Import Tailwind CSS
import './index.css';

// Start mock server if API URL is not set
if (!import.meta.env.VITE_API_URL) {
  mockServer({ environment: 'development' });
  console.log('🔶 Using mock API server (no VITE_API_URL provided)');
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
```

## 13. Install and Configure UI Components

Create a script to add ShadCN UI components as needed. For this step, you'll need at least these components:

```bash
# Install the base UI components
npx shadcn-ui@latest init

# Add form-related components
npx shadcn-ui@latest add button card form input label checkbox
npx shadcn-ui@latest add dropdown-menu avatar 
```

## 14. Run the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to see your application.

Try these things:
1. Log in with email: `john@example.com` and password: `password123`
2. Log out
3. Register a new account
4. Verify that protected routes work correctly

## What's Next?

In the next step, we'll implement the main layout and navigation components, enhancing the user interface to provide a better user experience. 