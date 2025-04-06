# Step 3: Main Layout and Navigation

In this step, we'll significantly enhance the application's structure by implementing a responsive main layout. This includes:

*   A persistent sidebar for navigation on larger screens.
*   A slide-out "sheet" menu for smaller screens.
*   An updated header with navigation controls and user actions.
*   Using custom hooks and utility functions for cleaner code.

## 1. Add Required UI Components

First, let's add the necessary ShadCN UI components using the CLI. We'll need components for the user avatar, layout separators, the mobile slide-out sheet, notification badges, and tooltips.

```bash
npx shadcn-ui@latest add avatar separator sheet badge tooltip
```

*   `avatar`: For displaying user profile pictures or initials.
*   `separator`: Visual dividers.
*   `sheet`: The slide-out panel used for the mobile menu.
*   `badge`: Small indicators, often used for notification counts.
*   `tooltip`: Shows helpful text on hover.

## 2. Create Utility Functions

We need two important utility functions: one for robustly merging CSS class names (`cn`) and another for generating user initials (`getInitials`).

Update `src/lib/utils.js`. Replace the existing basic `cn` function with the standard version that uses `clsx` and `tailwind-merge` (which we installed in Step 1). This ensures Tailwind classes are merged correctly, handling conflicts and removing duplicates.

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

**Explanation of `cn`:**

*   **Why not just join strings?** Tailwind utilities can conflict (e.g., `p-2` and `p-4`). Simply joining them might lead to unpredictable styling.
*   **`clsx`**: A tiny utility for constructing `className` strings conditionally. You can pass strings, objects, or arrays.
*   **`tailwind-merge` (`twMerge`)**: Intelligently merges Tailwind CSS class lists, resolving conflicts by ensuring the last conflicting utility takes precedence (e.g., `twMerge('p-2', 'p-4')` results in just `p-4`).
*   **Together**: `cn` first uses `clsx` to handle conditional logic and then `twMerge` to resolve any Tailwind conflicts, giving you a clean final class string.

Now, create a new file for formatting utilities: `src/utils/formatters.js`. We'll add the `getInitials` function here to avoid duplicating it.

```js
// src/utils/formatters.js

/**
 * Generates initials from a user's name.
 * @param {string | undefined | null} name - The user's full name.
 * @returns {string} - The generated initials (e.g., "NV") or a default ("U").
 */
export const getInitials = (name) => {
  if (!name) return "U"; // Default if no name
  
  // Split name by spaces, take the first character of each part,
  // join them, convert to uppercase, and take the first two characters.
  const initials = name
    .split(" ")
    .map(part => part[0]) // Get first char of each part
    .filter(Boolean)     // Remove empty strings if there are multiple spaces
    .join("")           // Join the chars
    .toUpperCase();
    
  return initials.substring(0, 2); // Return max 2 initials
};

// Add other formatting functions here later (e.g., formatDate, formatNumber)
```

## 3. Create a Media Query Hook

To make our layout responsive (sidebar visible on desktop, hidden in a sheet on mobile), we need to detect the screen size. A custom hook `useMediaQuery` is a clean way to do this.

Create `src/hooks/useMediaQuery.js`:

```jsx
// src/hooks/useMediaQuery.js
import { useState, useEffect } from 'react';

/**
 * Custom Hook: useMediaQuery
 * Checks if a CSS media query string matches the current viewport.
 * @param {string} query - The media query string (e.g., "(min-width: 768px)").
 * @returns {boolean} - True if the query matches, false otherwise.
 */
export function useMediaQuery(query) {
  // State to hold whether the query matches
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window.matchMedia is supported (it is in all modern browsers)
    if (typeof window.matchMedia !== 'function') {
      console.warn('window.matchMedia is not supported');
      return;
    }
    
    // Create a MediaQueryList object
    const media = window.matchMedia(query);
    
    // Update the state initially if the current match status is different
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Define the listener function to update state on change
    const listener = () => {
      setMatches(media.matches);
    };

    // Add the event listener for changes in the media query status
    // Use the newer addEventListener method for broader compatibility
    media.addEventListener('change', listener);
    
    // Cleanup function: Remove the listener when the component unmounts
    return () => media.removeEventListener('change', listener);
    
  // Re-run the effect only if the query string itself changes
  }, [query]); // Removed `matches` from dependency array to prevent potential loops

  return matches;
}
```

**Explanation:**

*   This hook uses the browser's `window.matchMedia` API.
*   It takes a media query string (like `(min-width: 1024px)`).
*   `useEffect` sets up a listener that updates the `matches` state whenever the viewport size changes and crosses the threshold defined in the query.
*   The cleanup function in `useEffect` removes the listener to prevent memory leaks when the component using the hook unmounts.

## 4. Enhance the Main Layout Component

Now, let's update `src/layouts/MainLayout.jsx` to use the `useMediaQuery` hook and incorporate the `Sidebar` (which we'll create next).

```jsx
// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from "react"; // Import React
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";
import Sidebar from "./Sidebar"; // We will create this next
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils"; // Import the cn utility

/**
 * Main application layout for authenticated users.
 * Features a responsive sidebar (persistent on desktop, sheet on mobile)
 * and the main content area.
 */
function MainLayout() {
  // Hook to check if the viewport is large (desktop)
  const isDesktop = useMediaQuery("(min-width: 1024px)"); // lg breakpoint in Tailwind
  
  // State to control sidebar visibility (especially for mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Effect to manage sidebar state based on screen size changes
  useEffect(() => {
    // If screen becomes desktop, ensure sidebar state reflects this (though Sidebar component handles display)
    // If screen becomes mobile, explicitly close the sidebar if it was open
    if (!isDesktop) {
      setSidebarOpen(false);
    }
    // We don't automatically open it on desktop here; the Sidebar component logic handles that.
  }, [isDesktop]);
  
  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    // Root div for the layout
    <div 
      className={cn(
        "min-h-screen w-full bg-background text-foreground flex flex-col",
        // Add classes to prevent scroll issues when mobile sheet is open
        // Adjust based on actual behavior if needed
      )}
    >
      {/* Header: Pass the toggle function */}
      <MainHeader onMenuToggle={handleToggleSidebar} isSidebarOpen={sidebarOpen} />
      
      {/* Main content area: Use flexbox for sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Conditionally rendered/styled based on isDesktop and sidebarOpen */}
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} // Allow Sidebar to close itself (e.g., on nav item click)
          isDesktop={isDesktop} 
        />
        
        {/* Main Content Area */}
        <main 
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out",
            // Adjust margin/padding if needed based on fixed/sticky sidebar behavior
            // For this setup, the sidebar is part of the flex container
          )}
        >
          {/* Content Padding & Max Width Container */}
          <div className="container mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {/* Outlet renders the matched child route component */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
```

**Explanation:**

*   `useMediaQuery` determines if we're on a large screen.
*   `sidebarOpen` state controls the visibility of the mobile `Sheet`.
*   `useEffect` resets `sidebarOpen` to `false` when switching to a mobile view.
*   The `Sidebar` component (created next) receives props (`open`, `onClose`, `isDesktop`) to manage its display and behavior.
*   The main content area uses `flex-1` and `overflow-auto` to take up remaining space and allow scrolling.
*   `cn` is used for potentially applying conditional classes later if needed.

## 5. Update the Header Component

Update `src/layouts/MainHeader.jsx` to include a menu toggle button for mobile and slightly refined user menu logic. We also import the `getInitials` utility.

```jsx
// src/layouts/MainHeader.jsx
import React from "react"; // Import React
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils"; // Import cn
import { getInitials } from "@/utils/formatters"; // Import getInitials

// Icons
import { 
  LogOut, 
  Settings, 
  UserCircle, 
  Menu, // Hamburger menu icon
  X, // Close icon (optional, handled by Sheet)
  Bell, // Notifications icon
  MessagesSquare // Messages icon
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Main application header.
 * Includes logo, mobile menu toggle, notification/message icons, and user dropdown menu.
 * @param {object} props - Component props.
 * @param {() => void} props.onMenuToggle - Function to toggle the mobile sidebar.
 */
function MainHeader({ onMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    // Sticky header with background blur effect
    <header className="sticky top-0 z-40 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Left side: Mobile Menu Toggle + Logo */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hamburger menu button - only visible on non-desktop screens (hidden on lg and up) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" // Hide on large screens
            onClick={onMenuToggle} // Trigger sidebar toggle
            aria-label="Toggle menu" // Accessibility
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo/Brand Link */}
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            CoderComm
          </Link>
        </div>

        {/* Right side: Icons + User Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Message Icon with Tooltip & Badge (Example) */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <MessagesSquare className="h-5 w-5" />
                  {/* Example Badge - Replace with real count later */}
                  <Badge 
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    2
                  </Badge>
                  <span className="sr-only">Messages</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notification Icon with Tooltip & Badge (Example) */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {/* Example Badge - Replace with real count later */}
                  <Badge 
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    3
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Dropdown Menu */}
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
                {/* Link to User's Profile Page (We'll create this later) */}
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

// Add PropTypes if needed, e.g., for onMenuToggle
import PropTypes from 'prop-types';
MainHeader.propTypes = {
  onMenuToggle: PropTypes.func.isRequired,
};

export default MainHeader;
```

**Explanation:**

*   A `Menu` button is added, visible only on smaller screens (`lg:hidden`). It calls the `onMenuToggle` function passed from `MainLayout`.
*   Notification and message icons are added as examples (functionality comes later).
*   `TooltipProvider` and `Tooltip` wrap the icons for hover hints.
*   The `Avatar` component now uses the imported `getInitials` function for its fallback.
*   Dropdown menu items link to `/account` (created next) and `/user/:userId` (created later).

## 6. Create the Responsive Sidebar Component

This is the core navigation component. It behaves differently on desktop vs. mobile.

Create `src/layouts/Sidebar.jsx`:

```jsx
// src/layouts/Sidebar.jsx
import React from 'react'; // Import React
import PropTypes from 'prop-types';
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { getInitials } from "@/utils/formatters"; // Import utility
import { toast } from "sonner"; // For "Coming Soon" notifications

// Icons
import { 
  Home, 
  Users, 
  UserPlus, 
  Image, // Example icon
  Settings,
  Bell, // Example icon
  LayoutGrid, // Generic dashboard/app icon
  X // Close icon
} from "lucide-react";

// ShadCN Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet"; // For mobile view
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // For potential badges

// --- Navigation Items Configuration ---
// Define navigation links structure. We'll add more as features are built.
const mainNavItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Friends", icon: Users, href: "#", disabled: true, badge: 0 }, // Disabled for now
  { label: "Friend Requests", icon: UserPlus, href: "#", disabled: true, badge: 2 }, // Disabled
  // { label: "Photos", icon: Image, href: "#", disabled: true }, // Example disabled item
];

const secondaryNavItems = [
  // { label: "Notifications", icon: Bell, href: "#", disabled: true, badge: 3 }, // Disabled
  { label: "Settings", icon: Settings, href: "/account" },
];

// --- Helper Component: NavItem ---
/**
 * Renders a single navigation item link.
 * Handles active state highlighting and displays icon, label, and optional badge.
 */
function NavItem({ item, isActive, onClick, isDesktop }) {
  const Icon = item.icon;
  
  const linkContent = (
    <>
      <Icon className={cn("h-5 w-5", isDesktop ? "lg:mr-2" : "mr-2")} />
      {/* Label: Hide text on collapsed desktop sidebar, show on mobile/expanded */}
      <span className={cn(isDesktop && "lg:inline", isDesktop ? "hidden" : "inline")}>
        {item.label}
      </span>
      {/* Badge: Show if item has a badge count > 0 */}
      {item.badge && item.badge > 0 && !item.disabled && (
        <Badge 
          variant="destructive" 
          className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
        >
          {item.badge}
        </Badge>
      )}
      {/* Indicate disabled state visually (optional) */}
      {item.disabled && <span className="ml-auto text-xs text-muted-foreground">(Soon)</span>}
    </>
  );

  // If item is disabled, show a button that triggers a toast
  if (item.disabled) {
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start text-muted-foreground cursor-not-allowed", isDesktop ? "px-2" : "px-3")}
        onClick={() => toast.info(`${item.label} feature coming soon!`)}
        aria-disabled="true"
      >
        {linkContent}
      </Button>
    );
  }

  // If item is enabled, render a Link wrapped in a Button
  return (
    <Button
      asChild // Makes the Button render as its child (the Link)
      variant={isActive ? "secondary" : "ghost"}
      className={cn("w-full justify-start", isDesktop ? "px-2" : "px-3")}
      onClick={onClick} // Propagate onClick (e.g., to close mobile sheet)
    >
      <Link to={item.href} aria-current={isActive ? "page" : undefined}>
        {linkContent}
      </Link>
    </Button>
  );
}

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  isDesktop: PropTypes.bool,
};

// --- Main Sidebar Component ---
/**
 * Responsive Sidebar Component.
 * - Renders as a fixed sidebar on desktop (`isDesktop` true).
 * - Renders as a Sheet (slide-out panel) on mobile (`isDesktop` false).
 * @param {object} props - Props.
 * @param {boolean} props.open - Whether the mobile sheet should be open.
 * @param {() => void} props.onClose - Function to close the mobile sheet.
 * @param {boolean} props.isDesktop - Whether the current view is desktop size.
 */
function Sidebar({ open, onClose, isDesktop }) {
  const location = useLocation(); // Hook to get current URL path
  const { user } = useAuth(); // Get current user data

  // Function to determine if a nav link should be marked active
  const isPathActive = (path) => {
    if (!path || path === '#') return false; // Ignore disabled links
    // Exact match for home page, startsWith for others
    return path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  };

  // --- Sidebar Content (JSX) ---
  // This JSX is rendered inside either the <aside> or the <SheetContent>
  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 py-4">
      {/* Mobile Header: Logo + Close Button */}
      {!isDesktop && (
        <div className="flex items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold text-primary" onClick={onClose}>
            CoderComm
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      {!isDesktop && <Separator />} 

      {/* User Profile Link Area */}
      <div className="px-3">
        <Link 
          to={`/user/${user?._id}`} 
          className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors" 
          onClick={onClose} // Close sheet on profile click
        >
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || 'User'} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          {/* Hide text on collapsed desktop, show otherwise */}
          <div className={cn("flex flex-col", isDesktop && "lg:flex", isDesktop ? "hidden" : "flex")}>
            <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground">View profile</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Section */}
      <nav className="grid items-start gap-1 px-2">
        {mainNavItems.map((item) => (
          <NavItem 
            key={item.href + item.label} // Use more unique key
            item={item} 
            isActive={isPathActive(item.href)} 
            onClick={!isDesktop ? onClose : undefined} // Close sheet on nav click (mobile only)
            isDesktop={isDesktop}
          />
        ))}
      </nav>

      <Separator className="my-2" />

      {/* Secondary Navigation Section (e.g., Settings) */}
      <nav className="grid items-start gap-1 px-2">
        {secondaryNavItems.map((item) => (
          <NavItem 
            key={item.href + item.label}
            item={item} 
            isActive={isPathActive(item.href)} 
            onClick={!isDesktop ? onClose : undefined} // Close sheet on nav click (mobile only)
            isDesktop={isDesktop}
          />
        ))}
      </nav>

      {/* Example: Theme Toggle (Placeholder) - Could be moved to header or settings */}
      {/* <div className="mt-auto px-2">
        <Button variant="outline" className="w-full justify-start" onClick={() => alert("Theme toggle coming soon!")}>
           <span className={cn(isDesktop && "lg:inline", isDesktop ? "hidden" : "inline")}>Theme: Light</span>
         </Button>
       </div> */}
    </div>
  );

  // --- Conditional Rendering based on screen size ---

  // DESKTOP: Render a static <aside> element
  if (isDesktop) {
    return (
      <aside 
        className={cn(
          // Base styles: border, background, height adjusted for sticky header, width transitions
          "relative hidden lg:block border-r bg-background h-[calc(100vh-4rem)] w-64 shrink-0 transition-width duration-300 ease-in-out", 
          // Add logic here later if you want a collapsible desktop sidebar
          // For now, it's always shown on desktop
        )}
      >
        {sidebarContent}
      </aside>
    );
  }

  // MOBILE: Render the content inside a ShadCN <Sheet> component
  return (
    <Sheet open={open} onOpenChange={onClose}> {/* Control Sheet visibility via props */}
      <SheetContent side="left" className="p-0 w-[280px]"> {/* Adjust width as needed */}
        {sidebarContent} {/* Render the same content */}
      </SheetContent>
    </Sheet>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDesktop: PropTypes.bool.isRequired,
};

export default Sidebar;
```

**Explanation:**

*   **Responsive Logic**: The component returns different JSX based on the `isDesktop` prop.
    *   If `isDesktop`, it renders an `<aside>` element (a standard sidebar).
    *   If not `isDesktop`, it renders a `<Sheet>` component from ShadCN, which handles the slide-out behavior. The `open` and `onClose` props control the sheet.
*   **`sidebarContent`**: The actual JSX for the sidebar's content (links, user info) is defined once and reused in both the `<aside>` and the `<SheetContent>` for consistency.
*   **Navigation Items**: `mainNavItems` and `secondaryNavItems` arrays define the links. We've added a `disabled: true` flag and updated `href: "#"` for features not yet implemented.
*   **`NavItem` Component**: A helper component to render each link. It handles:
    *   Displaying the icon and label.
    *   Highlighting the active link based on `isActive` prop.
    *   Showing badges if present.
    *   Rendering disabled links as non-interactive buttons that show a "Coming Soon" toast message.
    *   Closing the mobile sheet (`onClose`) when a link is clicked (mobile only).
*   **Active State (`isPathActive`)**: Determines if a link matches the current URL path (`location.pathname`). It handles the home path (`/`) exactly and uses `startsWith` for other paths (e.g., `/account` should be active if the path is `/account/settings`).
*   **Utilities**: Uses `cn`, `useAuth`, and the new `getInitials`.

## 7. Create Placeholder Account Page

We need the `AccountPage` since it's linked from the header and sidebar.

Create `src/pages/AccountPage.jsx`:

```jsx
// src/pages/AccountPage.jsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/formatters";

/**
 * Account Settings Page (Placeholder)
 * Displays basic user info. Actual editing will be added later.
 */
function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    // Should ideally not happen if AuthRequire works, but good practice
    return <div>Loading user data...</div>; 
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Basic profile details. Editing coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p>{user.username || "N/A"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">About Me</p>
            <p className="text-muted-foreground italic">
              {user.aboutMe || "No bio provided."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for other settings */}
      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
          <CardDescription>Password change, notifications, etc. (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">Settings management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountPage;
```

## 8. Update Routes

Update `src/routes/index.jsx` to include the `AccountPage` and ensure lazy loading is correctly set up. We remove the routes for the pages we deferred.

```jsx
// src/routes/index.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen for Suspense fallback

// Layouts
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";

// Route Guards
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

// Pages (Lazy loaded)
const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const AccountPage = React.lazy(() => import("../pages/AccountPage")); // Add AccountPage
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));

// Remove imports for deferred pages:
// import FriendsPage from "../pages/FriendsPage";
// import FriendRequestsPage from "../pages/FriendRequestsPage";
// import PhotosPage from "../pages/PhotosPage";
// import NotificationsPage from "../pages/NotificationsPage";

/**
 * Main Router configuration
 */
function Router() {
  return (
    // Use Suspense to handle lazy loading, show LoadingScreen as fallback
    <React.Suspense fallback={<LoadingScreen message="Loading page..." />}>
      <Routes>
        {/* Protected Routes (MainLayout) */}
        <Route
          path="/"
          element={
            <AuthRequire>
              <MainLayout />
            </AuthRequire>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} /> {/* Add account route */}
          
          {/* Add routes for other features (e.g., friends, user profiles) here later */}
          {/* <Route path="friends" element={<FriendsPage />} /> */}
          {/* <Route path="requests" element={<FriendRequestsPage />} /> */}
          {/* <Route path="user/:userId" element={<UserProfilePage />} /> */}
        </Route>

        {/* Guest Routes (BlankLayout) */}
        <Route element={<BlankLayout />}>
          <Route 
            path="/login" 
            element={<GuestRoute><LoginPage /></GuestRoute>}
          />
          <Route 
            path="/register" 
            element={<GuestRoute><RegisterPage /></GuestRoute>}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default Router;
```

## 9. Update Home Page Content

Let's refine the `src/pages/HomePage.jsx` content slightly to fit the new layout context.

```jsx
// src/pages/HomePage.jsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Home page component (Main Feed Area - Placeholder)
 */
function HomePage() {
  const { user } = useAuth();

  // Note: Loading state is handled by AuthRequire and Suspense

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Home Feed</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name || 'Developer'}!</CardTitle>
          <CardDescription>
            This is your main dashboard. Use the sidebar to navigate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The actual post feed, post creation form, and other widgets will be implemented in the upcoming steps.
          </p>
          <div className="bg-primary/10 text-primary p-4 rounded-md border border-primary/20">
            <p className="font-medium">
              Try clicking the disabled items in the sidebar (like Friends) to see the "Coming Soon" notification!
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for future content */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Feed Content (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">Posts from you and your friends will appear here...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
```

## 10. Running the Application

Now that we've implemented the main layout and navigation:

```bash
npm run dev
```

Visit your app (`http://localhost:5173` or similar) and log in.

**Things to Test:**

1.  **Desktop View (Large Screen):**
    *   You should see the permanent sidebar on the left.
    *   Hover over icons in the header (messages, notifications) to see tooltips.
    *   Click navigation links (Home, Settings) - the active link should highlight.
    *   Click disabled links (Friends, Requests) - you should see a "Coming Soon" toast notification.
    *   Click the user avatar in the header to open the dropdown menu.
2.  **Mobile View (Small Screen):**
    *   Resize your browser window or use browser developer tools to simulate a mobile device.
    *   The sidebar should disappear, and a hamburger menu icon (☰) should appear in the header.
    *   Click the hamburger icon - the sidebar should slide out from the left (as a `Sheet`).
    *   Click navigation links or the close button (X) in the sheet - the sheet should close.
    *   Click the overlay outside the sheet - the sheet should close.

## 11. Frequently Asked Questions (FAQ)

*   **Q: Why use `useMediaQuery` instead of CSS media queries?**
    *   A: While CSS handles visual styling based on screen size, JavaScript often needs to know the screen size to change *behavior* or render different component structures (like switching between a static `<aside>` and a slide-out `<Sheet>`). `useMediaQuery` provides this information reactively within our components.
*   **Q: What is the `Sheet` component from ShadCN?**
    *   A: It's a pre-built component for creating slide-out panels (often used for mobile menus, drawers, etc.). It handles the animation, overlay, and accessibility aspects for you.
*   **Q: How does the active link highlighting work in the sidebar?**
    *   A: The `useLocation()` hook from `react-router-dom` gives us the current URL path. The `isPathActive` function compares this path with each link's `href`. The `NavItem` component then uses the `isActive` boolean prop to apply a different style (`variant="secondary"`) to the active link's button.
*   **Q: Why is the `cn` utility function important?**
    *   A: It safely merges CSS classes, especially Tailwind utility classes. It prevents conflicts (e.g., applying `p-2` and `p-4` results in only `p-4`) and allows for easy conditional application of classes (`cn("base-class", isActive && "active-class")`).
*   **Q: Why defer creating all the placeholder pages?**
    *   A: Creating pages and routes before they have content adds clutter. By disabling the links initially and using placeholders like `#` or toast notifications, we keep the codebase focused on the current step. We'll add the pages and enable the links as we build each feature.

## What's Next?

We now have a solid, responsive foundation for our application's navigation and layout.

In **Step 4: User Profile System**, we'll start building out a key feature: allowing users to view profiles (initially their own). This will involve:

1.  Creating a `UserProfilePage` component.
2.  Fetching and displaying user data.
3.  Setting up the route for `/user/:userId`.

This will allow users to create and manage their online presence within the CoderComm platform. 