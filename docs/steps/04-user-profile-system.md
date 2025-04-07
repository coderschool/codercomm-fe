# Step 4: User Profile System

In this step, we'll implement the user profile page (`/user/:userId`). Users will be able to view profiles, including an "About" section and a list of the user's posts. If viewing their own profile, they'll also see an option to edit their information.

This involves:

1.  **Creating Profile Components:** Building:
    *   `ProfilePage`: The main page component for `/user/:userId`.
    *   `ProfileAbout`: Displays the read-only "About" section.
    *   `ProfileEditForm`: Allows the current user to edit their profile details.
    *   Re-using `PostList` (from a later step, but we anticipate its structure).
2.  **Fetching Data:** Using `useEffect` and `apiService` within `ProfilePage` to fetch user and post data.
3.  **Managing State:** Using `useState` for loading/error states within `ProfilePage`.
4.  **Adding Dynamic Routing:** Using `useParams` to get the `userId`.
5.  **Integrating Components:** Assembling the components within `ProfilePage` using Tabs.

## 1. Install Additional UI Components

We need components for tabs (to switch between Posts/About sections) and text areas (for the edit form).

```bash
npx shadcn-ui@latest add tabs textarea
```

*   `tabs`: Creates tabbed navigation.
*   `textarea`: Multi-line text input.

## 2. Create User Profile Feature Components

These components handle specific parts of the profile display and editing.

Create `src/features/user/ProfileAbout.jsx`:

```jsx
// src/features/user/ProfileAbout.jsx
import React from "react";
import PropTypes from 'prop-types';
import { Mail, MapPin, Briefcase, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn

/**
 * Displays the read-only "About" section of a user's profile.
 */
function ProfileAbout({ user, className }) {
  // Ensure user object exists
  if (!user) {
    return <p className="text-muted-foreground italic">User data not available.</p>;
  }

  const hasInfo = user.aboutMe || user.jobTitle || user.city || user.country || user.email || user.website;

  return (
    <Card className={cn("w-full", className)}> {/* Allow passing className */} 
      <CardHeader>
        {/* Use user.name safely */}
        <CardTitle>About {user.name || 'User'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* About Me Text */}
        {user.aboutMe ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{user.aboutMe}</p>
          </div>
        ) : null}

        {/* Details List - only render if there is info */}
        {hasInfo && user.aboutMe && <hr className="my-4 border-border" />} {/* Separator */} 

        <div className="space-y-3">
          {user.jobTitle && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{user.jobTitle}{user.company && ` at ${user.company}`}</span>
            </div>
          )}
          {(user.city || user.country) && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <span>Lives in {user.city}{user.city && user.country && ", "}{user.country}</span>
            </div>
          )}
          {/* Conditionally show email - consider privacy */}
          {user.email && ( 
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <a href={`mailto:${user.email}`} className="hover:underline truncate">{user.email}</a>
            </div>
          )}
          {user.website && (
            <div className="flex items-center text-sm">
              <LinkIcon className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {user.website}
              </a>
            </div>
          )}
        </div>

        {/* Message if no details provided */}
        {!hasInfo && (
          <p className="text-sm text-muted-foreground italic">No additional information provided.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Define PropTypes for the user object
ProfileAbout.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
    coverUrl: PropTypes.string,
    aboutMe: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    company: PropTypes.string,
    jobTitle: PropTypes.string,
    website: PropTypes.string,
    // Add other expected fields if necessary
  }),
  className: PropTypes.string, // Allow className prop
};

export default ProfileAbout;
```

Create `src/features/user/ProfileEditForm.jsx`:

```jsx
// src/features/user/ProfileEditForm.jsx
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppStore } from "@/lib/store"; // Import store for potential future use (e.g., updating currentUser)
import apiService from "@/lib/apiService"; // To make the API call
import { toast } from "sonner"; // For notifications

// ShadCN UI Components
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Validation schema
const profileSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name is too short").max(50, "Name too long"),
  aboutMe: yup.string().max(500, "About me cannot exceed 500 characters").nullable(),
  avatarUrl: yup.string().url("Avatar URL must be a valid URL (e.g., https://...)").nullable().transform(value => value || null),
  coverUrl: yup.string().url("Cover URL must be a valid URL (e.g., https://...)").nullable().transform(value => value || null),
  city: yup.string().max(50, "City name too long").nullable(),
  country: yup.string().max(50, "Country name too long").nullable(),
  company: yup.string().max(100, "Company name too long").nullable(),
  jobTitle: yup.string().max(100, "Job title too long").nullable(),
  website: yup.string().url("Website must be a valid URL").nullable().transform(value => value || null),
  // Add social links if editable
  facebookLink: yup.string().url("Invalid Facebook URL").nullable().transform(value => value || null),
  instagramLink: yup.string().url("Invalid Instagram URL").nullable().transform(value => value || null),
  linkedinLink: yup.string().url("Invalid LinkedIn URL").nullable().transform(value => value || null),
  twitterLink: yup.string().url("Invalid Twitter URL").nullable().transform(value => value || null),
}).required();

/**
 * Form component for editing the current user's profile.
 * Uses apiService directly to PUT updates.
 */
function ProfileEditForm({ user, onCancel, onSuccess, className }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Get Zustand action to potentially update current user state immediately
  const updateUserInStore = useAppStore(state => state.updateCurrentUser); // Assuming we add this action

  // Initialize React Hook Form
  const form = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      aboutMe: user?.aboutMe || "",
      avatarUrl: user?.avatarUrl || "",
      coverUrl: user?.coverUrl || "",
      city: user?.city || "",
      country: user?.country || "",
      company: user?.company || "",
      jobTitle: user?.jobTitle || "",
      website: user?.website || "",
      facebookLink: user?.facebookLink || "",
      instagramLink: user?.instagramLink || "",
      linkedinLink: user?.linkedinLink || "",
      twitterLink: user?.twitterLink || "",
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    console.log("Submitting profile update:", data);

    try {
      // Use apiService to make the PUT request to the /users/me endpoint
      // The mock API handles updating user1 based on this endpoint
      const updatedUser = await apiService.put('/users/me', data);
      
      toast.success("Profile updated successfully!");
      
      // Optional: Update the user in Zustand store immediately for faster UI feedback
      // if (updateUserInStore) updateUserInStore(updatedUser); 
      
      if (onSuccess) onSuccess(updatedUser); // Pass updated user data back if needed
      
    } catch (error) {
      console.error("Profile update failed:", error);
      const errorMsg = error.message || "Failed to update profile. Please try again.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display submission errors */}
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Full Name*</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
            {/* Avatar URL */}
            <FormField control={form.control} name="avatarUrl" render={({ field }) => (
              <FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} disabled={isSubmitting} /></FormControl><FormDescription>URL of your profile picture.</FormDescription><FormMessage /></FormItem> )}/>
            {/* Cover URL */}
            <FormField control={form.control} name="coverUrl" render={({ field }) => (
              <FormItem><FormLabel>Cover Photo URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} disabled={isSubmitting} /></FormControl><FormDescription>URL of your cover image.</FormDescription><FormMessage /></FormItem> )}/>
            {/* About Me */}
            <FormField control={form.control} name="aboutMe" render={({ field }) => (
              <FormItem><FormLabel>About Me</FormLabel><FormControl><Textarea placeholder="Tell us about yourself..." className="resize-y min-h-[100px]" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
            
            {/* Location & Work in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
            </div>

            {/* Website & Social Links */}
             <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem><FormLabel>Website URL</FormLabel><FormControl><Input type="url" placeholder="https://yourwebsite.com" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
              {/* Add fields for facebookLink, instagramLink, linkedinLink, twitterLink similarly */} 
             {/* Example: LinkedIn */}
             <FormField control={form.control} name="linkedinLink" render={({ field }) => (
                <FormItem><FormLabel>LinkedIn Profile URL</FormLabel><FormControl><Input type="url" placeholder="https://linkedin.com/in/..." {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )}/>
              {/* ... other social links ... */}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

ProfileEditForm.propTypes = {
  user: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ProfileEditForm;
```

**Explanation:**

*   **`ProfileAbout.jsx`**: Simple component displaying user data passed via props. Uses `cn` for class merging.
*   **`ProfileEditForm.jsx`**: Uses React Hook Form (`useForm`) and Yup (`yupResolver`) for form handling and validation. Imports `apiService` directly. The `onSubmit` function calls `apiService.put('/users/me', ...)` and manages its own loading (`isSubmitting`) and error (`submitError`) states using `useState`. It calls the `onSuccess` or `onCancel` prop functions passed down from `ProfilePage`.

## 3. Create `ProfilePage` Component (Main View)

This is the core page component for `/user/:userId`. It fetches data, manages state, and arranges the sub-components.

Create `src/pages/ProfilePage.jsx`:

```jsx
// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "@/lib/store"; // To get current user ID
import apiService from "@/lib/apiService"; // To fetch data
import { formatDistanceToNow } from "date-fns";

// ShadCN UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"; // Added Card imports
import { Pencil, UserPlus, UserMinus, Calendar, AlertCircle } from "lucide-react";

// Feature Components
import ProfileAbout from "@/features/user/ProfileAbout";
import ProfileEditForm from "@/features/user/ProfileEditForm";
// Assume PostList exists (we'll create it later) - create a placeholder for now
const PostListPlaceholder = ({ posts }) => (
  <Card><CardHeader><CardTitle>Posts</CardTitle></CardHeader>
    <CardContent className="text-center text-muted-foreground py-8">
      User posts will appear here. (PostList component coming soon!)
      {posts && <p className="text-xs mt-2">(Loaded {posts.length} post items)</p>}
    </CardContent>
  </Card>
);
PostListPlaceholder.propTypes = { posts: PropTypes.array }; // Add PropTypes

import LoadingScreen from "@/components/LoadingScreen";
import { getInitials } from "@/utils/formatters";
import PropTypes from 'prop-types'; // Import PropTypes

/**
 * User Profile Page: Fetches and displays user info and posts.
 * Uses useEffect and apiService for data fetching.
 * Manages loading/error states locally.
 */
function ProfilePage() {
  const { userId } = useParams(); // Get target userId from URL
  const currentUser = useAppStore(state => state.currentUser); // Get logged-in user

  // State for this page
  const [profileUser, setProfileUser] = useState(null); // Data for the displayed profile
  const [userPosts, setUserPosts] = useState([]);       // Posts by the profile user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);    // Toggle edit mode

  const isCurrentUserProfile = currentUser?._id === userId;

  // Data fetching function using useCallback to memoize
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(`ProfilePage: Fetching data for userId: ${userId}`);
    try {
      // Fetch profile and posts in parallel
      const [userResponse, postsResponse] = await Promise.all([
        apiService.get(`/users/${userId}`),
        apiService.get(`/posts/user/${userId}`)
      ]);
      
      // apiService interceptor returns { user } for /users/:id
      setProfileUser(userResponse.user); 
      // apiService interceptor returns { posts, count, totalPages } for /posts/user/:userId
      setUserPosts(postsResponse.posts || []);
      console.log("ProfilePage: Data fetched successfully", { user: userResponse.user, posts: postsResponse.posts });
      
    } catch (err) {
      console.error("ProfilePage: Error fetching data:", err);
      setError(err.message || "Failed to load profile data.");
      setProfileUser(null); // Clear user data on error
      setUserPosts([]); // Clear posts on error
    } finally {
      setLoading(false);
    }
  }, [userId]); // Dependency: re-run if userId changes

  // Fetch data on component mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Handler for successful profile update
  const handleUpdateSuccess = (updatedUserData) => {
    // Option 1: Refetch all data (simple)
    fetchData(); 
    // Option 2: Update local state directly (faster UI)
    // setProfileUser(updatedUserData); 
    setIsEditing(false); // Close the edit form
  };
  
  // --- Render Logic ---
  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Profile</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!profileUser) {
     return (
       <Alert variant="default" className="max-w-lg mx-auto">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>User Not Found</AlertTitle>
         <AlertDescription>
           Could not find a profile for the specified user ID.
         </AlertDescription>
       </Alert>
     );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* --- Profile Header --- */}
      <Card className="overflow-hidden"> {/* Use Card for structure */} 
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 md:h-60 w-full bg-muted"> {/* Adjusted height */} 
            {profileUser.coverUrl ? (
              <img
                src={profileUser.coverUrl}
                alt={`${profileUser.name}'s cover photo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30" />
            )}
          </div>

          {/* Avatar & Info Area */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background bg-background rounded-full flex-shrink-0">
              <AvatarImage src={profileUser.avatarUrl || ''} alt={profileUser.name} />
              <AvatarFallback className="text-4xl">
                {getInitials(profileUser.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 sm:pb-2 text-center sm:text-left flex-grow min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate" title={profileUser.name}>{profileUser.name}</h1>
              {profileUser.createdAt && (
                 <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground mt-1">
                   <Calendar className="h-4 w-4 mr-1.5" />
                   <span>Joined {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })}</span>
                 </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="ml-auto mt-4 sm:mt-0 sm:pb-2 flex-shrink-0">
              {isCurrentUserProfile ? (
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              ) : (
                // Placeholder Friend Button - functionality later
                <Button size="sm" onClick={() => toast.info("Friend actions coming soon!")}>
                  <UserPlus className="h-4 w-4 mr-1.5" /> Add Friend
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* --- Edit Form (Conditional) --- */}
      {isEditing && isCurrentUserProfile && (
         <ProfileEditForm 
            user={profileUser} 
            onCancel={() => setIsEditing(false)} 
            onSuccess={handleUpdateSuccess} // Pass handler to refetch/update data
            className="mb-6" // Add margin when form is shown
         />
      )}

      {/* --- Profile Content Tabs (Only show if not editing) --- */}
      {!isEditing && (
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6"> {/* Simplified tabs */}
            <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger> {/* Placeholder */} 
          </TabsList>
          
          <TabsContent value="posts">
             {/* Use placeholder until PostList is built */}
             <PostListPlaceholder posts={userPosts} />
          </TabsContent>
          
          <TabsContent value="about">
            <ProfileAbout user={profileUser} />
          </TabsContent>
          
          <TabsContent value="friends">
            <Card>
              <CardHeader><CardTitle>Friends</CardTitle></CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">Friends list feature coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default ProfilePage;
```

**Explanation:**

*   **Data Fetching**: Uses `useEffect` hook triggered by `userId` changes. Inside, `fetchData` (memoized with `useCallback`) calls `apiService.get` for both user details and user posts in parallel using `Promise.all`.
*   **State Management**: Uses `useState` hooks (`profileUser`, `userPosts`, `loading`, `error`, `isEditing`) to manage the component's local state.
*   **Error Handling**: `try...catch` block in `fetchData` sets the `error` state, which is then displayed using the `Alert` component.
*   **Loading State**: `loading` state is set to `true` before fetching and `false` in the `finally` block. `LoadingScreen` is shown while `loading` is true.
*   **`isCurrentUserProfile`**: Determines if the logged-in user (`currentUser` from `useAppStore`) matches the `userId` from the URL.
*   **Conditional Rendering**: Shows the edit button only for the current user. Shows `ProfileEditForm` only when `isEditing` is true and it's the current user's profile. Shows the Tabs only when *not* editing.
*   **`handleUpdateSuccess`**: This function is passed to `ProfileEditForm`. When called (after a successful PUT request), it currently refetches all profile data using `fetchData()` and closes the edit form (`setIsEditing(false)`). This ensures the displayed data is up-to-date.
*   **`PostListPlaceholder`**: Since `PostList` isn't built yet, a simple placeholder is used.
*   **Layout**: Uses `Card` for the header section and `Tabs` for content switching.

## 4. Update Routes

Ensure the route for `ProfilePage` exists in `src/routes/index.jsx`.

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
const AccountPage = React.lazy(() => import("../pages/AccountPage"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage")); // <-- Add ProfilePage
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));

function Router() {
  return (
    <React.Suspense fallback={<LoadingScreen message="Loading page..." />}>
      <Routes>
        {/* --- Protected Routes --- */}
        <Route
          path="/"
          element={
            <AuthRequire>
              <MainLayout />
            </AuthRequire>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="user/:userId" element={<ProfilePage />} /> {/* <-- Add ProfilePage route */} 
        </Route>

        {/* --- Guest Routes --- */}
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

*   Added `React.lazy` import for `ProfilePage`.
*   Added `<Route path="user/:userId" element={<ProfilePage />} />`. The `:userId` part makes it a dynamic route parameter.

## 5. Test the Profile Page

1.  **Start the app:** `npm run dev`
2.  **Log in.**
3.  **Navigate:** Manually change the URL in your browser to view different profiles:
    *   `/user/user1` (Your own profile - you should see the "Edit Profile" button)
    *   `/user/user2` (Another user's profile - you should see "Add Friend")
    *   `/user/user3`
    *   `/user/invalid-id` (Should show the "User Not Found" alert)
4.  **Check Tabs:** Click between the "Posts", "About", and "Friends" tabs.
5.  **Test Editing (on your own profile /user/user1):**
    *   Click "Edit Profile".
    *   The tabs should disappear, and the `ProfileEditForm` should appear.
    *   Make a change (e.g., add to the "About Me" section).
    *   Click "Save Changes".
    *   You should see a success toast.
    *   The form should disappear, and the tabs should reappear.
    *   The "About" tab should now display your updated information (because `handleUpdateSuccess` triggered `fetchData`).
    *   Click "Edit Profile" again, then click "Cancel". The form should close without saving.

## 6. Frequently Asked Questions (FAQ)

*   **Q: Why fetch data in `useEffect` instead of using a library like React Query or SWR?**
    *   A: For this tutorial, we're keeping dependencies minimal and demonstrating the core React concepts (`useEffect`, `useState`) for data fetching with `async/await` and `apiService`. Libraries like React Query offer powerful caching, background updates, and state management features but add complexity we're avoiding here. In a real-world application, especially one with more complex data needs, using a dedicated data-fetching library is highly recommended.
*   **Q: Why use local state (`useState`) in `ProfilePage` for loading/error instead of Zustand?**
    *   A: Profile data fetching is specific to this page/route. Using local state keeps the state management contained within the component that needs it, reducing complexity in the global Zustand store. If profile data or its loading status needed to be accessed by many *unrelated* components, moving it to Zustand might make sense.
*   **Q: How does the `ProfileEditForm` update the displayed profile?**
    *   A: When the form is submitted successfully (`onSubmit` -> `apiService.put`), it calls the `onSuccess` prop function (`handleUpdateSuccess` in `ProfilePage`). `handleUpdateSuccess` then calls `fetchData()` again, which re-runs the API calls to get the latest user and post data, updating the `profileUser` state in `ProfilePage` and causing a re-render with the new information.
*   **Q: What does `useParams()` do?**
    *   A: It's a hook from `react-router-dom` that extracts dynamic parameters from the URL. For the route `<Route path="user/:userId" ... />`, `useParams()` inside `ProfilePage` returns an object like `{ userId: "user1" }` if the URL is `/user/user1`.

## What's Next?

We now have a functional user profile page where users can view information and posts, and edit their own details. 

In **Step 5: Post Creation & Feed**, we'll build the components for creating new posts and displaying the main activity feed on the `HomePage`.