# Step 8: Account Settings Page (Read-Only)

Now that users can log in, view posts, and manage friends, they need a place to see their own profile information. We'll update the existing `AccountPage` component to display the logged-in user's details in a read-only format.

*(Note: We previously considered adding an edit form here, but for simplicity in this tutorial, we'll keep this page read-only for now, matching the current state of the codebase.)*

## 1. Refine `AccountPage.jsx`

Let's update the `src/pages/AccountPage.jsx` component to present the `currentUser` data cleanly using `shadcn/ui` components. We'll also add a loading state.

```jsx
// src/pages/AccountPage.jsx
import React from "react";
import { useAppStore } from "@/lib/store";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/formatters";
import { Loader2 } from "lucide-react"; // Import loader icon

/**
 * Account Settings Page (Read-Only)
 * Displays basic user info. Editing functionality is planned for the future.
 */
function AccountPage() {
  // Get the current user from the Zustand store
  const currentUser = useAppStore((state) => state.currentUser);

  // Display loading state if currentUser isn't available yet
  // This might happen briefly on initial load or if there's an error
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Once currentUser is loaded, display the profile info
  return (
    // Center content and add vertical spacing
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* --- Profile Information Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your basic profile details. Profile editing is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4"> { /* Add padding top */}
          {/* Avatar and Name/Email Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage
                src={currentUser.avatarUrl || ""} // Provide empty string fallback
                alt={currentUser.name}
              />
              <AvatarFallback className="text-xl"> { /* Larger initials */}
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-semibold truncate">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t pt-6"> { /* Add border */}
             <div>
                <p className="font-medium text-muted-foreground">Username</p>
                <p>{currentUser.username || "N/A"}</p>
             </div>
             {/* Location (City, Country) */}
             {(currentUser.city || currentUser.country) && (
                <div>
                    <p className="font-medium text-muted-foreground">Location</p>
                    <p>
                        {currentUser.city}
                        {currentUser.city && currentUser.country && ", "}
                        {currentUser.country}
                    </p>
                </div>
             )}
             {/* Work (Job Title, Company) */}
              {(currentUser.jobTitle || currentUser.company) && (
                <div>
                    <p className="font-medium text-muted-foreground">Work</p>
                    <p>
                        {currentUser.jobTitle}
                        {currentUser.jobTitle && currentUser.company && " at "}
                        {currentUser.company}
                    </p>
                </div>
             )}
          </div>

          {/* About Me Section */}
          {currentUser.aboutMe && ( // Only show if aboutMe exists
             <div className="border-t pt-6">
                <p className="text-sm font-medium text-muted-foreground">About Me</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap"> { /* Use whitespace-pre-wrap */}
                  {currentUser.aboutMe}
                </p>
             </div>
          )}
           {!currentUser.aboutMe && (
                <div className="border-t pt-6">
                   <p className="text-sm font-medium text-muted-foreground">About Me</p>
                   <p className="text-sm text-muted-foreground italic mt-1">No bio provided.</p>
                </div>
           )}

        </CardContent>
      </Card>

      {/* --- Placeholder for Other Settings --- */}
      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
          <CardDescription>
            Password change, notifications, etc. (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Further settings management will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountPage;
```
*Explanation:*
*   The component fetches `currentUser` from the `useAppStore`.
*   It displays a loading spinner (`Loader2`) if `currentUser` is not yet available.
*   It uses `Card` components from `shadcn/ui` to structure the information.
*   It displays the user's avatar, name, email, username, location, work details, and bio.
*   Fallback values ("N/A", "No bio provided.") are used if certain fields are missing.
*   The text explicitly states that profile editing is coming soon.
*   A placeholder card for future settings (password change, etc.) is included.

## 2. Verify Routing and Links

Ensure the route and links related to the account page are still correct.

a.  **Router (`src/routes/index.jsx`):** Verify that the route for `/account` is still defined within the authenticated `MainLayout` group and uses the `AccountPage` component.

    ```jsx
    // src/routes/index.jsx (verify this part)
    // ... imports ...
    const AccountPage = React.lazy(() => import("../pages/AccountPage"));
    // ...
    function Router() {
      return (
        <React.Suspense fallback={/* ... */}>
          <Routes>
            <Route
              path="/"
              element={<AuthRequire><MainLayout /></AuthRequire>}
            >
              <Route index element={<HomePage />} />
              <Route path="account" element={<AccountPage />} /> {/* Ensure this line exists */}
              {/* Other authenticated routes */}
            </Route>
            {/* Guest routes... */}
            {/* Not Found route... */}
          </Routes>
        </React.Suspense>
      );
    }
    export default Router;
    ```

b.  **Main Header (`src/layouts/MainHeader.jsx`):** Verify that the "Account Settings" link in the user dropdown menu correctly points to `/account`.

    ```jsx
    // src/layouts/MainHeader.jsx (verify this part)
    // ... imports ...
    function MainHeader() {
      // ... state and logout handler ...
      return (
        <header>
          {/* ... logo, icons ... */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>{/* ... Avatar Button ... */}</DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* ... Label ... */}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer"> {/* Ensure Link points to /account */}
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>{/* ... Logout ... */}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
      );
    }
    export default MainHeader;
    ```

## 3. Test Account Page

1.  Restart the development server (`npm run dev`) and log in.
2.  Click on the user avatar in the top-right corner to open the dropdown menu.
3.  Click on "Account Settings".
4.  You should be navigated to the `/account` route.
5.  The `AccountPage` should display, showing your profile picture, name, email, username, etc., in a read-only format.
6.  The text indicating that editing is "coming soon" should be visible.

**Progress Check:** Users can now view their own basic profile information on the Account Settings page. Although editing isn't implemented in this tutorial version, the foundation is there. The next logical step would be to implement the public profile view page, allowing users to see other users' profiles when clicking their names or avatars. 