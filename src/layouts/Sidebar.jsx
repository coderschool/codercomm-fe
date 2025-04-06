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
  X, // Close icon
  Search // Import Search icon
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
  { label: "Friends", icon: Users, href: "/friends", disabled: false, badge: 0 },
  { label: "Friend Requests", icon: UserPlus, href: "/requests", disabled: false, badge: 2 },
  { label: "Find Users", icon: Search, href: "/find-users", disabled: false },
];

const secondaryNavItems = [
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
    if (path === "/") return location.pathname === "/";
    if (path.startsWith('/user/')) return location.pathname.startsWith('/user/'); // Special case for user profile
    return location.pathname.startsWith(path);
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
          className={cn(
            "flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors",
            isPathActive(`/user/${user?._id}`) && "bg-muted" // Highlight if on own profile
          )} 
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