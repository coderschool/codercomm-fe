# Step 3: Main Layout and Basic Header

In this step, we'll establish the basic structure for authenticated users and refine the main header. This involves:

*   Reviewing the simple `MainLayout` component.
*   Updating the `MainHeader` to use `useAppStore` for user information and actions.
*   Adding essential utility functions.
*   Creating a placeholder `AccountPage` using `useAppStore`.

## 1. Add Required UI Components

If you haven't already, add the `avatar` and `dropdown-menu` components from ShadCN UI. We'll also add `tooltip` and `separator` for potential future use or refinement.

```bash
npx shadcn-ui@latest add avatar dropdown-menu tooltip separator
```

*   `avatar`: For displaying user profile pictures or initials.
*   `dropdown-menu`: For the user menu in the header.
*   `tooltip`: Shows helpful text on hover.
*   `separator`: Visual dividers used within menus or layouts.

## 2. Create Utility Functions

We need utility functions for merging CSS class names (`cn`) and generating user initials (`getInitials`).

Ensure `src/lib/utils.js` contains the standard `cn` function using `clsx` and `tailwind-merge` (installed in Step 1):

```js
// src/lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes intelligently, handling conflicts.
 * Uses `clsx` for conditional classes and `twMerge` to resolve Tailwind conflicts.
 * @param {...import("clsx").ClassValue} inputs - Class names or conditional class objects.
 * @returns {string} - The merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

Create `src/utils/formatters.js` (if it doesn't exist) for the `getInitials` function:

```js
// src/utils/formatters.js

/**
 * Generates initials from a user's name.
 * @param {string | undefined | null} name - The user's full name.
 * @returns {string} - The generated initials (e.g., "NV") or a default ("U").
 */
export const getInitials = (name) => {
  if (!name) return "U"; // Default if no name

  const initials = name
    .trim() // Remove leading/trailing whitespace
    .split(/\s+/) // Split by any whitespace
    .map(part => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();

  // Return the first two initials, or just the first if only one part
  return initials.substring(0, 2);
};

// Add other formatting functions here later (e.g., formatDate)
```
*(Note: Improved the `getInitials` function slightly to handle extra spaces)*

## 3. Review the Main Layout Component

Ensure `src/layouts/MainLayout.jsx` has the following simplified structure. It acts as a container for authenticated pages, rendering the `MainHeader` and the main content area (`Outlet`).

```jsx
// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader"; // We will update this header next

/**
 * MainLayout - Simple layout component for authenticated pages
 * Includes header and content area.
 */
function MainLayout() {
  return (
    // Basic flex column structure ensuring minimum screen height
    <div className="min-h-screen flex flex-col bg-secondary/30"> {/* Added subtle background */} 
      <MainHeader />

      {/* flex-grow allows the main content to take up available space */}
      {/* Added container, max-width, margin, and padding for content */}
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-6 md:py-8"> 
        <Outlet />
      </main>

      {/* A Footer could be added here later if needed */}
      {/* <footer className="py-4 text-center text-sm text-muted-foreground">© CoderComm</footer> */}
    </div>
  );
}

export default MainLayout;
```

**Explanation:**

*   This layout uses a simple flexbox structure (`flex flex-col`).
*   `min-h-screen` ensures it takes at least the full viewport height.
*   A subtle background color (`bg-secondary/30`) is added to the main layout div.
*   `MainHeader` is rendered at the top.
*   `main` tag now includes `container max-w-7xl mx-auto px-4 py-6 md:py-8` to center and constrain the width of the page content, adding padding.
*   `flex-grow` ensures the main content area expands to fill the remaining vertical space.
*   `<Outlet />` is where React Router will render the component corresponding to the current authenticated route.

## 4. Update the Header Component

Update `src/layouts/MainHeader.jsx` to use `useAppStore` directly for user data and logout action. Placeholder icons for notifications/messages can remain.

```jsx
// src/layouts/MainHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store"; // Use Zustand store directly
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/formatters";

// Icons
import { LogOut, Settings, UserCircle, Bell, MessagesSquare, Home } from "lucide-react"; // Added Home

// ShadCN Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge"; // Removed Badge for now

/**
 * Main application header.
 * Uses useAppStore for user data and actions.
 */
function MainHeader() {
  const navigate = useNavigate();
  // Get user data and logout action from Zustand store using a selector
  const { user, logout } = useAppStore(state => ({
    user: state.currentUser,
    logout: state.logout,
  }));

  const handleLogout = () => {
    logout(); // Call action from store
    navigate("/login", { replace: true }); // Redirect
  };

  return (
    // Sticky header with background blur
    <header className="sticky top-0 z-40 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Left side: Logo/Brand Link */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
             <Home className="h-5 w-5" /> {/* Added Home icon */} 
             <span>CoderComm</span>
          </Link>
        </div>

        {/* Right side: Icons + User Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Placeholder Message Icon */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => alert('Messages coming soon!')}>
                  <MessagesSquare className="h-5 w-5" />
                  <span className="sr-only">Messages</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Messages (Coming Soon)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Placeholder Notification Icon */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => alert('Notifications coming soon!')}>
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Notifications (Coming Soon)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Dropdown Menu - Render only if user exists */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name || 'User'} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || 'No email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Link to User's Own Profile Page */}
                <DropdownMenuItem asChild>
                  <Link to={`/user/${user._id}`} className="cursor-pointer">
                    <UserCircle className="h-4 w-4 mr-2" />
                    <span>Your Profile</span>
                  </Link>
                </DropdownMenuItem>
                {/* Link to Account Settings Page */}
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
```

**Explanation:**

*   Imports `useAppStore` instead of `useAuth`.
*   Uses `useAppStore(state => ({ user: state.currentUser, logout: state.logout }))` to select the necessary state and actions.
*   The header remains `sticky` with a blur effect.
*   The logo now includes a `Home` icon.
*   Placeholder icons for Messages and Notifications are kept non-functional.
*   The User Dropdown Menu is conditionally rendered based on `user` and provides links to the user's own profile page (`/user/${user._id}`), the Account Settings page (`/account`), and the logout action.
*   `getInitials` utility is used for the Avatar fallback.

## 5. Create Placeholder Account Page

We need the `AccountPage` as it's linked from the header dropdown. This page will also use `useAppStore`.

Create `src/pages/AccountPage.jsx`:

```jsx
// src/pages/AccountPage.jsx
import React from "react";
import { useAppStore } from "@/lib/store"; // Use Zustand store directly
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/formatters";
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen

/**
 * Account Settings Page (Placeholder)
 * Displays basic user info using useAppStore.
 */
function AccountPage() {
  // Get user data directly from the store
  const { user } = useAppStore(state => ({
    user: state.currentUser,
  }));

  if (!user) {
    // Should not happen if AuthRequire works, but good failsafe
    return <LoadingScreen message="Loading user data..." fullScreen={false} />;
  }

  return (
    // Use fragments or a simple div, layout is handled by MainLayout
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your basic profile details. Editing coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={user.avatarUrl || ''} alt={user.name || 'User'} />
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name || 'User Name'}</p>
              <p className="text-sm text-muted-foreground">{user.email || 'user@example.com'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium">Username</p>
            <p className="text-muted-foreground">{user.username || "N/A"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">About Me</p>
            <p className="text-muted-foreground italic">
              {user.aboutMe || "No bio provided."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for other settings sections */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Password change options coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">Placeholder for security settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountPage;
```

**Explanation:**

*   Imports and uses `useAppStore` with a selector to get the `currentUser`.
*   Includes a basic loading check (`!user`).
*   Displays user information using ShadCN `Card` and `Avatar` components.
*   Removes the redundant `container`/`padding` divs as `MainLayout` now handles page layout.

## 6. Update Routes

Ensure the route for the new `AccountPage` is added to your main router configuration.

Update `src/routes/index.jsx`:

```jsx
// src/routes/index.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";

// Layouts
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";

// Route Guards
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

// Pages (Lazy load pages)
const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const AccountPage = React.lazy(() => import("../pages/AccountPage")); // Add AccountPage
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
// const UserProfilePage = React.lazy(() => import("../pages/UserProfilePage")); // For later

function Router() {
  return (
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
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} /> {/* Add AccountPage route */} 
          {/* Placeholder for user profile route */}
          {/* <Route path="user/:userId" element={<UserProfilePage />} /> */}
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default Router;
```

**Explanation:**

*   Added `React.lazy` import for `AccountPage`.
*   Added a new `<Route path="account" element={<AccountPage />} />` nested within the `MainLayout` protected routes.

## Summary

In this step, we've:

*   Reviewed the `MainLayout` structure with improved content spacing.
*   Updated `MainHeader` to use `useAppStore` directly for user data/actions and included links to Profile/Account.
*   Ensured utility functions `cn` and `getInitials` are available.
*   Created a placeholder `AccountPage` using `useAppStore`.
*   Added the route for the `AccountPage`.

The application now has a consistent header and basic structure for authenticated views, with components correctly accessing the Zustand store.

Next, we'll focus on **Step 4: User Profile System**, creating the page to display user details based on the route parameter. 