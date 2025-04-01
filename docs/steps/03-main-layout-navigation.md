# Step 3: Main Layout and Navigation

In this step, we'll enhance the application by creating a comprehensive layout system with a responsive navigation menu. We'll focus on building a user-friendly interface that adapts to different screen sizes and provides clear navigation throughout the application.

## 1. Create UI Components

First, let's install additional ShadCN UI components that we'll need for the main layout:

```bash
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tooltip
```

## 2. Enhance the Main Layout

Let's update our `MainLayout.jsx` to include a sidebar navigation system:

```jsx
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import MainHeader from "./MainHeader";
import Sidebar from "./Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Main layout component for authenticated pages
 * Includes responsive sidebar and main content area
 */
function MainLayout() {
  // Track if sidebar is open, default to true on desktop, false on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Handle changes in screen size
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => !isDesktop && setSidebarOpen(false)} 
          isDesktop={isDesktop} 
        />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
```

## 3. Create a Media Query Hook

Create a custom hook to handle responsive design at `src/hooks/useMediaQuery.js`:

```jsx
import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a media query matches
 * @param {string} query - CSS media query to check
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update matches state initially
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Define listener to track changes
    const listener = () => {
      setMatches(media.matches);
    };

    // Add event listener
    media.addEventListener('change', listener);
    
    // Clean up listener on unmount
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

## 4. Update the Header Component

Update the `MainHeader.jsx` component to include a menu toggle and improved user menu:

```jsx
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { 
  LogOut, 
  Settings, 
  UserCircle, 
  Menu,
  Bell,
  MessagesSquare
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Main header component with navigation and user menu
 */
function MainHeader({ onMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      <div className="container h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="text-2xl font-bold text-primary">
            CoderComm
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <MessagesSquare className="h-5 w-5" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    variant="destructive"
                  >
                    2
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    variant="destructive"
                  >
                    3
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/user/${user?._id}`} className="cursor-pointer">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Your Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/account" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
```

## 5. Create a Sidebar Component

Create a responsive sidebar at `src/layouts/Sidebar.jsx`:

```jsx
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  UserPlus, 
  X,
  Image,
  Settings,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Navigation items configuration
const mainNavItems = [
  { 
    label: "Home", 
    icon: Home, 
    href: "/" 
  },
  { 
    label: "Friends", 
    icon: Users, 
    href: "/friends" 
  },
  { 
    label: "Friend Requests", 
    icon: UserPlus, 
    href: "/requests",
    badge: 2
  },
  { 
    label: "Photos", 
    icon: Image, 
    href: "/photos" 
  },
];

const secondaryNavItems = [
  { 
    label: "Notifications", 
    icon: Bell, 
    href: "/notifications",
    badge: 3
  },
  { 
    label: "Settings", 
    icon: Settings, 
    href: "/account" 
  },
];

/**
 * Navigation item component
 */
function NavItem({ item, isActive, isDesktop }) {
  const Icon = item.icon;
  
  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        isDesktop ? "px-2" : "px-3"
      )}
    >
      <Link to={item.href}>
        <Icon className={cn("h-5 w-5", isDesktop && "mr-0 lg:mr-2")} />
        <span className={cn(isDesktop && "hidden lg:inline")}>
          {item.label}
        </span>
        {item.badge && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {item.badge}
          </span>
        )}
      </Link>
    </Button>
  );
}

/**
 * Sidebar component for main navigation
 */
function Sidebar({ open, onClose, isDesktop }) {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isPathActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Content of the sidebar - used in both mobile and desktop versions
  const sidebarContent = (
    <div className="h-full flex flex-col gap-4 py-4">
      {!isDesktop && (
        <div className="px-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            CoderComm
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {!isDesktop && <Separator />}

      <div className="px-4">
        <Link to={`/user/${user?._id}`} className="flex items-center gap-3 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className={cn("flex flex-col", isDesktop && "hidden lg:flex")}>
            <span className="font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">View profile</span>
          </div>
        </Link>
      </div>

      <div className="space-y-1 px-2">
        {mainNavItems.map((item) => (
          <NavItem 
            key={item.href} 
            item={item} 
            isActive={isPathActive(item.href)} 
            isDesktop={isDesktop}
          />
        ))}
      </div>

      <Separator className="my-2" />

      <div className="space-y-1 px-2">
        {secondaryNavItems.map((item) => (
          <NavItem 
            key={item.href} 
            item={item} 
            isActive={isPathActive(item.href)} 
            isDesktop={isDesktop}
          />
        ))}
      </div>

      <div className="mt-auto px-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => {
            // Feature coming soon - could show a dialog
            alert("Theme selection coming soon!");
          }}
        >
          <span className={cn(isDesktop && "hidden lg:inline")}>
            Theme: Light
          </span>
        </Button>
      </div>
    </div>
  );

  // For desktop, render a regular sidebar
  if (isDesktop) {
    return (
      <aside 
        className={cn(
          "border-r bg-background h-[calc(100vh-4rem)] w-16 lg:w-64 shrink-0 overflow-auto",
          !open && "hidden"
        )}
      >
        {sidebarContent}
      </aside>
    );
  }

  // For mobile, render a slide-out sheet
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-[280px]">
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );
}

export default Sidebar;
```

## 6. Add a Utility Function for Class Names

Create a utility function for conditional class names at `src/lib/utils.js`:

```jsx
/**
 * Merge classes together
 * @param {...string} classes - Classes to merge
 * @returns {string} - Merged classes
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
```

## 7. Create Placeholder Pages

Let's create placeholder pages for our routes. First, create a simple account settings page at `src/pages/AccountPage.jsx`:

```jsx
import React from "react";
import useAuth from "@/hooks/useAuth";

/**
 * Account settings page
 */
function AccountPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{user?.name}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{user?.email}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">About</p>
            <p>{user?.aboutMe || "No information provided."}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="bg-blue-50 text-blue-700 p-4 rounded">
            In the full implementation, this page would include form fields to update your profile information, change your password, and manage notification settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
```

Create a friends page at `src/pages/FriendsPage.jsx`:

```jsx
import React from "react";

/**
 * Friends list page
 */
function FriendsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Friends</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
          In the full implementation, this page would display a list of your friends with options to view their profiles, send messages, or remove them from your friends list.
        </p>
        
        <div className="text-center p-8 text-muted-foreground">
          <p>Friends list will be implemented in a future step.</p>
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;
```

Create a friend requests page at `src/pages/FriendRequestsPage.jsx`:

```jsx
import React from "react";

/**
 * Friend requests page
 */
function FriendRequestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Friend Requests</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
          In the full implementation, this page would display incoming friend requests that you can accept or decline, as well as a section for your outgoing requests.
        </p>
        
        <div className="text-center p-8 text-muted-foreground">
          <p>Friend requests will be implemented in a future step.</p>
        </div>
      </div>
    </div>
  );
}

export default FriendRequestsPage;
```

Create a photos page at `src/pages/PhotosPage.jsx`:

```jsx
import React from "react";

/**
 * Photos gallery page
 */
function PhotosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Photos</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
          In the full implementation, this page would display a gallery of photos you've uploaded or been tagged in, with options to view, download, or delete them.
        </p>
        
        <div className="text-center p-8 text-muted-foreground">
          <p>Photos gallery will be implemented in a future step.</p>
        </div>
      </div>
    </div>
  );
}

export default PhotosPage;
```

Create a notifications page at `src/pages/NotificationsPage.jsx`:

```jsx
import React from "react";

/**
 * Notifications page
 */
function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
          In the full implementation, this page would display a list of notifications about friend requests, comments, likes, and other activity on your profile or posts.
        </p>
        
        <div className="text-center p-8 text-muted-foreground">
          <p>Notifications will be implemented in a future step.</p>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
```

## 8. Update Routes

Update the router configuration in `src/routes/index.jsx` to include all our new pages:

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
import AccountPage from "../pages/AccountPage";
import FriendsPage from "../pages/FriendsPage";
import FriendRequestsPage from "../pages/FriendRequestsPage";
import PhotosPage from "../pages/PhotosPage";
import NotificationsPage from "../pages/NotificationsPage";

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
        <Route path="friends" element={<FriendsPage />} />
        <Route path="requests" element={<FriendRequestsPage />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="account" element={<AccountPage />} />
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

## 9. Improve the Home Page

Update the home page to match our new layout in `src/pages/HomePage.jsx`:

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
    <>
      <h1 className="text-2xl font-bold mb-6">Home Feed</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-muted-foreground mb-4">
          This is your home feed. In the next steps, we'll implement post creation and feed functionality.
        </p>
        
        <div className="bg-blue-50 text-blue-700 p-4 rounded">
          <p>
            Try out the navigation menu to explore different sections of the app. 
            These sections will be implemented in future steps of this tutorial.
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Create and share posts with your friends</li>
          <li>Upload and organize photos</li>
          <li>Comment on posts and photos</li>
          <li>Receive real-time notifications</li>
          <li>Find and connect with new friends</li>
        </ul>
      </div>
    </>
  );
}

export default HomePage;
```

## 10. Running the Application

Now that we've implemented the main layout and navigation:

```bash
npm run dev
```

Visit `http://localhost:5173` and log in to see your improved application with a responsive layout and navigation system.

Test the responsiveness by resizing your browser window or using the browser's device emulation tools. The sidebar should become a hamburger menu on mobile devices, and the navigation items should adapt accordingly.

## What's Next?

In the next step, we'll implement the user profile system, including:

1. Viewing user profiles
2. Displaying user information, posts, and friends
3. Editing your own profile
4. Managing profile settings

This will allow users to create and manage their online presence within the CoderComm platform. 