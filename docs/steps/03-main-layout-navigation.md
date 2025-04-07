# Step 3: Main Layout and Basic Header

In this step, we'll establish the basic structure for authenticated users and refine the main header. This involves:

*   Creating a simple `MainLayout` component.
*   Updating the `MainHeader` with user information and navigation links.
*   Adding essential utility functions.
*   Creating a placeholder `AccountPage`.

## 1. Add Required UI Components

If you haven't already, add the `avatar` and `dropdown-menu` components from ShadCN UI. We'll also add `tooltip` and `separator` for potential future use or refinement.

```bash
npx shadcn@latest add avatar dropdown-menu tooltip separator
```

*   `avatar`: For displaying user profile pictures or initials.
*   `dropdown-menu`: For the user menu in the header.
*   `tooltip`: Shows helpful text on hover.
*   `separator`: Visual dividers used within menus or layouts.

## 2. Create Utility Functions

We need utility functions for merging CSS class names (`cn`) and generating user initials (`getInitials`).

Update `src/lib/utils.js` if you haven't already, replacing the basic `cn` function with the standard version using `clsx` and `tailwind-merge` (installed in Step 1). This ensures Tailwind classes merge correctly.

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

Create `src/utils/formatters.js` for the `getInitials` function.

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
    .split(" ")
    .map(part => part[0]) 
    .filter(Boolean)     
    .join("")           
    .toUpperCase();
    
  return initials.substring(0, 2); // Return max 2 initials
};

// Add other formatting functions here later
```

## 3. Simplify the Main Layout Component

Ensure `src/layouts/MainLayout.jsx` has the following simplified structure. It acts as a container for authenticated pages, rendering the `MainHeader` and the main content area (`Outlet`).

```jsx
// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";

/**
 * MainLayout - Simple layout component for authenticated pages
 * Includes header and content area.
 */
function MainLayout() {
  return (
    // Basic flex column structure ensuring minimum screen height
    <div className="min-h-screen flex flex-col">
      <MainHeader />

      {/* flex-grow allows the main content to take up available space */}
      <main className="flex-grow"> 
        {/* Outlet renders the matched child route component (e.g., HomePage) */}
        <Outlet />
      </main>

      {/* A Footer could be added here later if needed */}
    </div>
  );
}

export default MainLayout;
```

**Explanation:**

*   This layout uses a simple flexbox structure (`flex flex-col`).
*   `min-h-screen` ensures it takes at least the full viewport height.
*   `MainHeader` is rendered at the top.
*   `main className="flex-grow"` ensures the main content area expands to fill the remaining vertical space.
*   `<Outlet />` is where React Router will render the component corresponding to the current authenticated route (like `HomePage`, `AccountPage`, etc.).

## 4. Update the Header Component

Update `src/layouts/MainHeader.jsx` to primarily include the logo/brand link and the user dropdown menu. Placeholder icons for notifications/messages can remain for future implementation.

```jsx
// src/layouts/MainHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils"; 
import { getInitials } from "@/utils/formatters"; 

// Icons
import { 
  LogOut, 
  Settings, 
  UserCircle, 
  Bell, // Notifications icon (placeholder)
  MessagesSquare // Messages icon (placeholder)
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
import { Badge } from "@/components/ui/badge"; // For potential future use
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // For potential future use

/**
 * Main application header.
 * Includes logo, placeholder icons, and user dropdown menu.
 */
function MainHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show a toast notification for logout failure
    }
  };

  return (
    // Sticky header
    <header className="sticky top-0 z-40 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Left side: Logo/Brand Link */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            CoderComm
          </Link>
        </div>

        {/* Right side: Icons + User Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Placeholder Message Icon (Functionality later) */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => alert('Messages coming soon!')}>
                  <MessagesSquare className="h-5 w-5" />
                  {/* <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">2</Badge> */}
                  <span className="sr-only">Messages</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Placeholder Notification Icon (Functionality later) */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => alert('Notifications coming soon!')}>
                  <Bell className="h-5 w-5" />
                  {/* <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge> */}
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications (Coming Soon)</p>
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
                {/* Link to User's Own Profile Page */}
                <DropdownMenuItem asChild>
                  {/* Use template literal for dynamic user ID */}
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

*   The mobile menu toggle button (`<Button>` with `Menu` icon) and the related `onMenuToggle` prop have been removed.
*   The header remains `sticky`.
*   The core structure is the logo on the left and icons/user menu on the right.
*   Placeholder icons for Messages and Notifications are kept but are non-functional for now (they just show an alert).
*   The User Dropdown Menu provides links to the user's own profile page (`/user/${user._id}`), the Account Settings page (`/account`), and the logout action.
*   `getInitials` is used for the Avatar fallback.

## 5. Create Placeholder Account Page

We need the `AccountPage` as it's linked from the header dropdown.

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
    return <div className="container mx-auto p-4">Loading user data...</div>; 
  }

  return (
    // Add container and padding for consistent layout
    <div className="container mx-auto px-4 py-6 space-y-6"> 
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
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          {/* Add more placeholder fields if needed */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            {/* Assuming username might exist on user object */}
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

*   This is a basic page displaying the logged-in user's information fetched via `useAuth`.
*   It uses ShadCN `Card` components for structure.
*   Actual form inputs and update logic will be added in a later step.
*   Added container and padding to the root div for better spacing within the `MainLayout`.

## Summary

In this step, we've:

*   Established the simple `MainLayout` using `MainHeader` and `Outlet`.
*   Refined `MainHeader` to include the logo and a functional user dropdown menu with links to the Profile and Account pages, removing the mobile toggle.
*   Added utility functions `cn` and `getInitials`.
*   Created a placeholder `AccountPage`.

The application now has a consistent header and basic structure for authenticated views. Next, we'll focus on building out the user profile system. 