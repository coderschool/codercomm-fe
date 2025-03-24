# Routing and Layouts

In this step, we'll set up routing with React Router and create layouts for our application.

## Create Basic UI Components

Let's start by creating a few basic UI components.

### Create MainHeader Component

Create `src/layouts/MainHeader.jsx`:

```jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import useAuth from "../hooks/useAuth";

function MainHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="flex items-center">
                <Link
                  to={`/user/${user.id}`}
                  className="flex items-center mr-4 hover:text-primary"
                >
                  <img
                    className="h-8 w-8 rounded-full mr-2"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
```

### Create MainFooter Component

Create `src/layouts/MainFooter.jsx`:

```jsx
import React from "react";

function MainFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-center">
      <div className="container mx-auto">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} CoderComm. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default MainFooter;
```

## Create Layout Components

Now let's create layout components for different parts of our application.

### Create MainLayout Component

Create `src/layouts/MainLayout.jsx`:

```jsx
import React from "react";
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
}

export default MainLayout;
```

### Create BlankLayout Component

Create `src/layouts/BlankLayout.jsx`:

```jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Logo from "../components/Logo";

function BlankLayout() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <Logo />
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default BlankLayout;
```

## Create Protected Route Components

Now let's create components that handle protected routes.

### Create AuthRequire Component

Create `src/routes/AuthRequire.jsx`:

```jsx
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";

function AuthRequire({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AuthRequire;
```

### Create GuestRoute Component

Create `src/routes/GuestRoute.jsx`:

```jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";

function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default GuestRoute;
```

## Create Basic Page Components

Now let's create basic page components.

### Create HomePage Component

Create `src/pages/HomePage.jsx`:

```jsx
import React from "react";
import useAuth from "../hooks/useAuth";

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to CoderComm!</h1>
        <p className="text-lg text-gray-700">
          Hello, {user.name}! This is your feed. Here you'll see posts from yourself and people you follow.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-center text-gray-500">No posts yet. Stay tuned!</p>
      </div>
    </div>
  );
}

export default HomePage;
```

### Create LoginPage Component

Create `src/pages/LoginPage.jsx`:

```jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuth from "../hooks/useAuth";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (error) {
      setError("responseError", { message: error.message });
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Login to CoderComm</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.responseError && (
          <div className="text-red-500 text-sm font-medium px-3 py-2 bg-red-50 rounded-md">
            {errors.responseError.message}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
        
        <div className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
```

### Create RegisterPage Component

Create `src/pages/RegisterPage.jsx`:

```jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuth from "../hooks/useAuth";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const { name, email, password } = data;
    try {
      await registerUser({ name, email, password });
      navigate("/", { replace: true });
    } catch (error) {
      setError("responseError", { message: error.message });
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Register for CoderComm</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.responseError && (
          <div className="text-red-500 text-sm font-medium px-3 py-2 bg-red-50 rounded-md">
            {errors.responseError.message}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            {...register("passwordConfirmation")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.passwordConfirmation && (
            <p className="mt-1 text-sm text-red-500">{errors.passwordConfirmation.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
        >
          {isRegistering ? "Registering..." : "Register"}
        </button>
        
        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
```

### Create NotFoundPage Component

Create `src/pages/NotFoundPage.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Sorry, the page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
```

## Set Up Routing

Now let's set up routing for our application.

Create `src/routes/index.jsx`:

```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";

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
        {/* More authenticated routes will go here */}
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

## Update App.jsx

Finally, update `src/App.jsx` to use our router:

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

## Test Your Routing Setup

Now that we have routing set up, let's test it:

```bash
npm run dev
```

You should be able to:
- Navigate to `/login` and see the login page
- Log in and be redirected to the home page
- See the main layout with header and footer when authenticated
- Log out and be redirected to the login page
- Navigate to `/register` to see the registration page
- See a 404 page for any invalid routes

With routing and layouts in place, we've laid the foundation for our application. In the next steps, we'll build the user profile, post, and comment features.