# Step 4: User Profile System

In this step, we'll implement the user profile system. Users will be able to view profiles (their own via the `HomePage` tab, and others' via a dedicated `ProfilePage`), and edit their own profile information. This involves:

1.  **Setting up React Query:** Integrating the library for managing server state.
2.  **Creating Data Fetching Hooks:** Using `useQuery` and `useMutation` to fetch/update user data and posts.
3.  **Building Profile Components:** Creating:
    *   `ProfilePage`: For viewing any user's profile (`/user/:userId`).
    *   `ProfileAbout`: Displays the read-only "About" section.
    *   `ProfileEditForm`: Allows the user to edit their profile details.
    *   `Profile` (Tab Component): Displays the *current user's* info, post form, and posts within the `HomePage` tab.
4.  **Adding Dynamic Routing:** Using `useParams` for `ProfilePage`.
5.  **Integrating Components:** Placing the components into `ProfilePage` and `HomePage`.

## 1. Set Up React Query Provider

React Query requires a `QueryClientProvider` to wrap your application. This provider makes the query client available to all components and hooks. We also add the `ReactQueryDevtools` for easier debugging during development.

Update `src/main.jsx`:

```jsx
// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import React Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Import DevTools

// import { HelmetProvider } from 'react-helmet-async'; // Optional: if using Helmet

import App from './App';

// Import Tailwind CSS
import './index.css';

// --- React Query Client Setup ---
// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration options for all queries
      refetchOnWindowFocus: false, // Don't refetch data automatically when window gains focus
      retry: 1, // Retry failed requests once
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    },
  },
});

// --- Conditional Mock Server Initialization ---
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  import('./mockApi/server').then(({ mockServer }) => {
    mockServer({ environment: 'development' });
    console.log('🔶 Mock API Server Started (Development Mode)');
  }).catch(error => {
    console.error("Failed to start mock server:", error);
  });
} else if (import.meta.env.VITE_API_URL) {
  console.log(` Bypassing mock server. Using real API at: ${import.meta.env.VITE_API_URL}`);
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    {/* <HelmetProvider> */}
      {/* Wrap the app in QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {/* Add React Query DevTools (only renders in development) */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    {/* </HelmetProvider> */}
  </React.StrictMode>
);
```

**Explanation:**

*   `QueryClient`: Creates an instance of the React Query client, which manages caching and data fetching logic.
*   `QueryClientProvider`: Wraps the application, making the `queryClient` available via hooks like `useQuery`.
*   `ReactQueryDevtools`: A helpful tool (visible only in development) for inspecting query states, cache, and triggering actions.

## 2. Understanding the Mock API Endpoints for User Profiles

Our mock API (`src/mockApi/server.js`) already includes endpoints for this feature:

*   `GET /api/users/:id`: Get a specific user's profile by their ID.
*   `GET /api/posts/user/:userId`: Get posts created by a specific user.
*   `PUT /api/users/me`: Update the *current* user's profile (our mock simplifies this to only allow updating `user1`).

Remember, we interact with these endpoints via `apiService`; we don't modify the mock server itself.

## 3. Install Additional UI Components

We need components for tabs (to switch between Posts/About sections) and text areas (for the edit form).

```bash
npx shadcn@latest add tabs textarea alert
```

*   `tabs`: Creates tabbed navigation.
*   `textarea`: Multi-line text input.
*   `alert`: Used for displaying form errors.

## 4. Create User Data Hooks with React Query

Now, let's create custom hooks using React Query to fetch and update user-related data. This encapsulates the data fetching logic.

Create `src/hooks/useUserQuery.js`:

```jsx
// src/hooks/useUserQuery.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/apiService"; // Our Axios instance
import { toast } from "sonner"; // For notifications

// --- Custom Hook: useUserQuery ---
/**
 * Fetches a single user's profile data by their ID.
 * Uses React Query's `useQuery` for data fetching and caching.
 * @param {string | undefined} userId - ID of the user to fetch. The query is disabled if userId is falsy.
 * @returns {QueryResult} The result object from `useQuery`, containing user data, loading state, error state, etc.
 */
export function useUserQuery(userId) {
  return useQuery({
    // queryKey: Unique identifier for this query. 
    // React Query uses this for caching. Includes the user ID so different profiles have different cache entries.
    queryKey: ["users", userId], 
    
    // queryFn: The asynchronous function that performs the data fetching.
    queryFn: async () => {
      console.log(`Fetching user: ${userId}`); // Debug log
      // Use our apiService to make the GET request.
      // Assuming apiService interceptor returns response.data directly on success.
      const response = await apiService.get(`/users/${userId}`);
      return response.data; // Return the user data
    },
    
    // enabled: Controls if the query should automatically run.
    // We only run the query if a valid `userId` is provided. `!!userId` converts userId to a boolean.
    enabled: !!userId, 

    // staleTime: How long data is considered fresh (won't refetch on mount/focus). Default is 0.
    // staleTime: 5 * 60 * 1000, // Example: 5 minutes (can be set globally too)

    // cacheTime: How long inactive query data remains in cache. Default is 5 minutes.
    // cacheTime: 10 * 60 * 1000, // Example: 10 minutes
  });
}

// --- Custom Hook: useUpdateProfile ---
/**
 * Provides a mutation function to update the current user's profile.
 * Uses React Query's `useMutation` for handling the update operation.
 * @returns {MutationResult} The result object from `useMutation`, containing mutation function, status, etc.
 */
export function useUpdateProfile() {
  // Get the QueryClient instance - needed to invalidate/update cache after mutation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: The asynchronous function that performs the update.
    // It receives an object, typically containing the data needed for the update.
    mutationFn: async ({ userId, ...updateData }) => { 
      console.log(`Updating profile for user: ${userId}`, updateData); // Debug log
      // Use apiService to make the PUT request.
      // Our mock API is hardcoded to update '/users/me', but a real API would use userId.
      // We'll assume the API call targets the correct user based on authentication or userId.
      const response = await apiService.put(`/users/me`, updateData); // Mock uses /me
      // const response = await apiService.put(`/users/${userId}`, updateData); // Real API might use this
      return response.data; // Return the updated user data from the response
    },
    
    // onSuccess: Callback function executed after a successful mutation.
    // Receives the data returned by `mutationFn` and the variables passed to `mutate`.
    onSuccess: (updatedUser, variables) => {
      console.log("Profile update successful:", updatedUser);
      
      // --- Cache Invalidation/Update Strategy ---
      // It's crucial to update the cache after a mutation so the UI reflects changes.
      
      // Option 1: Invalidate queries related to the updated user.
      // This tells React Query that the data for these keys is stale and needs refetching.
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
      // Also invalidate the current user query if applicable
      queryClient.invalidateQueries({ queryKey: ["users", "me"] }); 
      // You might also need to invalidate related data, like user posts lists, etc.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user", variables.userId] });

      // Option 2 (More optimistic): Directly update the cache with the new data.
      // This can feel faster as the UI updates immediately without waiting for a refetch.
      // queryClient.setQueryData(["users", variables.userId], updatedUser);
      // queryClient.setQueryData(["users", "me"], updatedUser); // Update 'me' query too

      // For this tutorial, invalidation is simpler to demonstrate.
      
      toast.success("Profile updated successfully");
    },
    
    // onError: Callback function executed if the mutation fails.
    onError: (error) => {
      console.error("Profile update failed:", error);
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// --- Custom Hook: useUserPosts ---
/**
 * Fetches posts created by a specific user.
 * @param {string | undefined} userId - ID of the user whose posts to fetch. Query disabled if falsy.
 * @returns {QueryResult} Result object from `useQuery` for the user's posts.
 */
export function useUserPosts(userId) {
  return useQuery({
    // Query key includes user ID to cache posts per user.
    queryKey: ["posts", "user", userId], 
    queryFn: async () => {
      console.log(`Fetching posts for user: ${userId}`); // Debug log
      const response = await apiService.get(`/posts/user/${userId}`);
      // Assuming the API returns an object like { posts: [], count: X, totalPages: Y }
      return response.data; 
    },
    enabled: !!userId, // Only fetch if userId is provided
  });
}
```

**Explanation:**

*   **`useQuery`**: Hook for fetching data.
    *   `queryKey`: An array that uniquely identifies the data. React Query uses this for caching. When the key changes, or if data is invalidated, React Query might refetch.
    *   `queryFn`: The async function that performs the actual API call. It *must* return a promise that resolves with the data or throws an error.
    *   `enabled`: A boolean to conditionally enable/disable the query. Useful for dependent queries or queries that need an ID before running.
*   **`useMutation`**: Hook for operations that change data (POST, PUT, DELETE).
    *   `mutationFn`: The async function that performs the API call to modify data. It receives variables passed when calling the `mutate` function.
    *   `onSuccess`: Callback executed after the mutation succeeds. Ideal place to invalidate related queries or update the cache directly.
    *   `onError`: Callback executed if the mutation fails.
*   **`useQueryClient`**: Hook to get the Query Client instance, needed for interacting with the cache (e.g., `invalidateQueries`).
*   **`invalidateQueries`**: Tells React Query that data associated with certain `queryKey`s is stale and should be refetched the next time it's needed.

## 5. Create `ProfilePage` Component (for Viewing Others)

This page (`/user/:userId`) displays any user's profile using the hooks we created. It includes tabs for Posts and About sections.

Create `src/pages/ProfilePage.jsx`:

```jsx
// src/pages/ProfilePage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom"; // Hook to get URL parameters
import { useUserQuery, useUserPosts } from "@/hooks/useUserQuery"; // Our data hooks
import useAuth from "@/hooks/useAuth"; // To check if it's the current user's profile
import { formatDistanceToNow } from "date-fns"; // For relative date formatting

// ShadCN UI Components
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // For errors
import { Pencil, UserPlus, UserMinus, Calendar, AlertCircle } from "lucide-react"; // Icons

// Feature Components (We'll create these next)
import ProfileAbout from "@/features/user/ProfileAbout";
import ProfileEditForm from "@/features/user/ProfileEditForm";
import PostList from "@/features/post/PostList"; // Re-use PostList
import LoadingScreen from "@/components/LoadingScreen";

// Utilities
import { getInitials } from "@/utils/formatters"; // Import utility

/**
 * User Profile Page: Displays another user's information, posts, about section.
 * Fetches data via React Query hooks based on URL param.
 * Allows editing only if it's the current user's profile (edge case).
 */
function ProfilePage() {
  // Get the user ID from the URL (e.g., /user/user1 -> id = "user1")
  const { userId } = useParams(); 
  // Get the currently logged-in user from our auth hook
  const { user: currentUser } = useAuth();
  // State to toggle the profile editing form
  const [isEditing, setIsEditing] = useState(false);
  
  // --- Data Fetching using React Query ---
  // Fetch the profile user's data
  const { 
    data: profileUser, // Renamed data to profileUser for clarity
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError
  } = useUserQuery(userId); // Pass the userId from the URL
  
  // Fetch the posts for this profile user
  const { 
    data: postsData, // Contains { posts: [], count: X, totalPages: Y }
    isLoading: isLoadingPosts,
    // We could add error handling for posts too if needed
  } = useUserPosts(userId); // Pass the same userId

  // --- Computed State ---
  // Check if the profile being viewed belongs to the currently logged-in user
  const isCurrentUserProfile = currentUser?._id === userId;

  // --- Render Logic ---

  // Handle loading state for the user profile
  if (isLoadingUser) {
    return <LoadingScreen message="Loading profile..." />;
  }

  // Handle error state for the user profile
  if (isUserError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Profile</AlertTitle>
        <AlertDescription>
          {userError?.message || "An unexpected error occurred."}
        </AlertDescription>
      </Alert>
    );
  }
  
  // If data loaded but user is not found (e.g., invalid ID)
  if (!profileUser) {
     return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>User Not Found</AlertTitle>
         <AlertDescription>
           The profile for this user could not be found.
         </AlertDescription>
       </Alert>
     );
  }

  // --- JSX Structure ---
  return (
    <div className="space-y-8">
      {/* --- Profile Header Section --- */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted">
          {profileUser.coverUrl ? (
            <img
              src={profileUser.coverUrl}
              alt={`${profileUser.name}'s cover photo`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Placeholder gradient if no cover image
            <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary/50" />
          )}
        </div>

        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background bg-background">
            <AvatarImage src={profileUser.avatarUrl || ''} alt={profileUser.name} />
            <AvatarFallback className="text-4xl">
              {getInitials(profileUser.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="ml-0 sm:ml-4 mt-2 sm:mb-2 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">{profileUser.name}</h1>
            {/* Join Date - Using date-fns for formatting */}
            {profileUser.createdAt && (
               <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground mt-1">
                 <Calendar className="h-4 w-4 mr-1.5" />
                 <span>
                   Joined {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })}
                 </span>
               </div>
            )}
          </div>

          {/* Action Buttons (Edit/Add Friend) */}
          <div className="ml-auto mt-4 sm:mt-0 sm:mb-2">
            {isCurrentUserProfile ? (
              // Show Edit/Cancel button if it's the current user's profile
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant={isEditing ? "outline" : "default"}
                size="sm"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>
            ) : (
              // Show Add/Remove Friend button for other profiles (functionality later)
              <Button size="sm" onClick={() => toast.info("Friend actions coming soon!")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend 
                {/* Add logic here later based on friendship status */}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- Profile Content Tabs --- */}
      <Tabs defaultValue="posts" className="w-full">
        {/* Tab Triggers */}
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          {/* <TabsTrigger value="photos">Photos</TabsTrigger> */}
        </TabsList>
        
        {/* Posts Tab Content */}
        <TabsContent value="posts">
          {isLoadingPosts ? (
            <LoadingScreen message="Loading posts..." fullScreen={false} />
          ) : (
            // Pass the fetched posts array to the PostList component
            <PostList posts={postsData?.posts || []} /> 
          )}
        </TabsContent>
        
        {/* About Tab Content */}
        <TabsContent value="about">
          {/* Show edit form only if `isEditing` is true AND it's the current user's profile */}
          {isEditing && isCurrentUserProfile ? (
            <ProfileEditForm 
              user={profileUser} 
              // Pass callbacks to close the form on cancel/success
              onCancel={() => setIsEditing(false)} 
              onSuccess={() => setIsEditing(false)} 
            />
          ) : (
            // Otherwise, show the read-only About component
            <ProfileAbout user={profileUser} />
          )}
        </TabsContent>
        
        {/* Friends Tab Content (Placeholder) */}
        <TabsContent value="friends">
          <Card className="mt-4">
            <CardHeader><CardTitle>Friends</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Friends list feature coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Photos Tab Content (Placeholder) */}
        {/* <TabsContent value="photos">
          <Card className="mt-4">
            <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
            <CardContent>
               <p className="text-center text-muted-foreground py-8">
                 Photos gallery feature coming soon!
               </p>
             </CardContent>
           </Card>
         </TabsContent> */}
      </Tabs>
    </div>
  );
}

export default ProfilePage; // Changed from UserProfilePage
```

**Explanation:**

*   **`useParams`**: Gets the `userId` from the URL (`/user/:userId`).
*   **`useUserQuery(userId)`**: Fetches the profile data for the specific user ID. React Query handles caching and loading/error states (`isLoadingUser`, `isUserError`, `userError`).
*   **`useUserPosts(userId)`**: Fetches the posts for that user.
*   **`isCurrentUserProfile`**: A boolean flag to determine if the viewed profile belongs to the logged-in user.
*   **`isEditing` State**: Controls whether to show the `ProfileAbout` (view) or `ProfileEditForm` (edit) component.
*   **Conditional Rendering**: Shows loading screens or error messages based on query states. Shows the "Edit Profile" button only on the current user's profile.
*   **Date Formatting**: Uses `formatDistanceToNow` from `date-fns` for the "Joined..." date.
*   **`Tabs`**: ShadCN component used to structure the profile content.
*   **Passing Data**: Fetched `profileUser` and `postsData` are passed as props to child components (`ProfileAbout`, `ProfileEditForm`, `PostList`).

## 6. Create User Feature Components

These components handle specific parts of the profile display and editing.

Create `src/features/user/ProfileAbout.jsx`:

```jsx
// src/features/user/ProfileAbout.jsx
import React from "react";
import PropTypes from 'prop-types';
import { Mail, MapPin, Briefcase, Link as LinkIcon } from "lucide-react"; // Renamed Link to LinkIcon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Displays the read-only "About" section of a user's profile.
 */
function ProfileAbout({ user }) {
  if (!user) return null; // Handle case where user data might not be loaded yet

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {user.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* About Me Text */}
        {user.aboutMe && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{user.aboutMe}</p>
          </div>
        )}

        {/* Details List */}
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
           {user.email && ( // Consider privacy implications of showing email publicly
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              {/* Use mailto link for email */}
              <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
            </div>
          )}
          {/* Add other fields like website, social links if available in your data */}
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
         {!user.aboutMe && !user.jobTitle && !user.city && !user.country && !user.email && (
             <p className="text-sm text-muted-foreground italic">No additional information provided.</p>
         )}
      </CardContent>
    </Card>
  );
}

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
    // Add other expected fields
  }),
};

export default ProfileAbout;
```

Create `src/features/user/ProfileEditForm.jsx`:

```jsx
// src/features/user/ProfileEditForm.jsx
import React from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Services
import { useUpdateProfile } from "@/hooks/useUserQuery"; // The mutation hook

// ShadCN UI Components
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Yup validation schema for the profile edit form.
 */
const profileSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name is too short"),
  aboutMe: yup.string().max(500, "About me cannot exceed 500 characters"),
  // Allow empty strings or valid URLs
  avatarUrl: yup.string().url("Must be a valid URL (e.g., https://...)").nullable().transform(value => value || null),
  coverUrl: yup.string().url("Must be a valid URL (e.g., https://...)").nullable().transform(value => value || null),
  // Add other editable fields here (city, country, jobTitle, company, etc.)
  city: yup.string().max(50, "City name too long"),
  country: yup.string().max(50, "Country name too long"),
  company: yup.string().max(100, "Company name too long"),
  jobTitle: yup.string().max(100, "Job title too long"),
}).required();

/**
 * Form component for editing the current user's profile information.
 * Uses React Hook Form for state management and Yup for validation.
 * Calls the `useUpdateProfile` mutation hook on submit.
 */
function ProfileEditForm({ user, onCancel, onSuccess }) {
  // Get the mutation function and its state from the custom hook
  const { mutate: updateProfileMutate, isPending: isUpdating, error: updateError } = useUpdateProfile();
  
  // Initialize React Hook Form
  const form = useForm({
    resolver: yupResolver(profileSchema),
    // Set default values from the user prop
    defaultValues: {
      name: user?.name || "",
      aboutMe: user?.aboutMe || "",
      avatarUrl: user?.avatarUrl || "",
      coverUrl: user?.coverUrl || "",
      city: user?.city || "",
      country: user?.country || "",
      company: user?.company || "",
      jobTitle: user?.jobTitle || "",
      // Initialize other fields here
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    console.log("Form data submitted:", data);
    // Call the mutation function provided by useUpdateProfile
    // Pass the necessary variables (userId and the form data)
    updateProfileMutate(
      { userId: user._id, ...data }, 
      {
        // Optional: Add callbacks here if needed, though onSuccess/onError in the hook is usually preferred
        onSuccess: () => {
          console.log("Mutation succeeded from component");
          if (onSuccess) onSuccess(); // Call the prop callback to close the form
        },
        onError: (error) => {
           console.error("Mutation failed from component", error);
           // Error is already handled by the hook's onError and displayed below
        }
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display mutation errors */}
        {updateError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>
              {updateError.message || "Could not update profile. Please try again."}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* About Me Field */}
            <FormField
              control={form.control}
              name="aboutMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a little bit about yourself" 
                      className="resize-none min-h-[100px]" // Allow vertical resize
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of yourself. Max 500 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Title & Company */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="jobTitle"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Job Title</FormLabel>
                     <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="company"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Company</FormLabel>
                     <FormControl><Input placeholder="e.g., CoderSchool" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>

            {/* City & Country */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="city"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>City</FormLabel>
                     <FormControl><Input placeholder="e.g., Ho Chi Minh City" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="country"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Country</FormLabel>
                     <FormControl><Input placeholder="e.g., Vietnam" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
            
            {/* Avatar URL Field */}
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/avatar.png" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    Link to your profile picture (must be a valid URL).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cover URL Field */}
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Photo URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/cover.jpg" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    Link to your cover photo (must be a valid URL).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} // Call cancel callback from props
                disabled={isUpdating} // Disable while updating
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUpdating} // Disable while updating
              >
                {isUpdating ? "Saving..." : "Save Changes"}
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
};

export default ProfileEditForm;
```

**Explanation:**

*   **`ProfileAbout`**: Simple component that receives the `user` object and displays its properties.
*   **`ProfileEditForm`**:
    *   Uses `useForm` and `yupResolver` for form state and validation.
    *   Gets the `mutate` function (renamed to `updateProfileMutate`) and loading/error states (`isPending`, `error`) from the `useUpdateProfile` hook.
    *   Calls `updateProfileMutate` in the `onSubmit` handler, passing the `userId` and form `data`.
    *   Disables buttons while the mutation is pending (`isUpdating`).
    *   Displays mutation errors using an `Alert`.
    *   Calls `onCancel` or `onSuccess` (passed as props from `ProfilePage`) to signal completion or cancellation, allowing the parent to hide the form.

## 7. Create `Profile` Component (for `HomePage` Tab)

This component is specifically for the "Profile" tab on the *current user's* `HomePage`. It displays their basic info, the `PostForm`, and their own posts.

Create `src/features/user/Profile.jsx`:

```jsx
// src/features/user/Profile.jsx
import React from 'react';
import PropTypes from 'prop-types';
import useAuth from "@/hooks/useAuth";
import { useUserPosts } from "@/hooks/useUserQuery"; // Hook to fetch user's posts

// Reusable Components
import PostForm from "@/features/post/PostForm";
import PostList from "@/features/post/PostList"; // Re-use PostList component
import LoadingScreen from "@/components/LoadingScreen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Profile Tab Component:
 * Displays the current user's profile information (implicitly via context),
 * the PostForm, and their own posts.
 * Designed to be used within the HomePage tab structure.
 */
function Profile({ profile }) { // Receives the current user profile from HomePage
  const { user: currentUser } = useAuth(); // Double-check if profile prop is needed or useAuth is sufficient
  const userId = profile?._id; // Get user ID from the profile prop

  // Fetch only the posts for the current user
  const { 
    data: postsData, 
    isLoading: isLoadingPosts,
    isError: isPostsError,
    error: postsError 
  } = useUserPosts(userId, {
    // Enable the query only if we have a userId
    enabled: !!userId,
  });

  // Display loading state for posts
  if (isLoadingPosts) {
    return <LoadingScreen message="Loading your posts..." fullScreen={false} />;
  }
  
  // Display error state for posts
  if (isPostsError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Posts</AlertTitle>
        <AlertDescription>
          {postsError?.message || "Could not fetch your posts. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Post Creation Form */}
      {/* Ensure currentUser is available before rendering PostForm */}
      {currentUser && <PostForm />} 

      {/* 2. User's Posts List */}
      <div>
        <h2 className="text-lg font-semibold mb-4 mt-6">Your Posts</h2>
        {/* Pass the fetched posts to the PostList component */}
        <PostList posts={postsData?.posts || []} />
      </div>
    </div>
  );
}

Profile.propTypes = {
  profile: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    // Add other fields if needed by this component
  }).isRequired,
};

export default Profile;
```

**Explanation:**

*   This component is simpler than `ProfilePage` because it assumes it's showing the *current* user.
*   It fetches the user's posts using `useUserPosts(userId)`. Note the `enabled: !!userId` option ensures the query only runs when the ID is available.
*   It renders the `PostForm`. We assume `PostForm` handles its own logic for creating posts for the current user.
*   It renders the `PostList` component, passing the fetched posts specific to the current user.

## 8. Update Routes and `HomePage`

First, ensure the route for `ProfilePage` exists in `src/routes/index.jsx`:

```jsx
// src/routes/index.jsx (Ensure this route exists)
// ... other imports ...
import ProfilePage from "../pages/ProfilePage"; // Make sure it's imported

function Router() {
  return (
    <React.Suspense fallback={/* ... */}>
      <Routes>
        <Route path="/" element={<AuthRequire><MainLayout /></AuthRequire>}>
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} />
          {/* Route for viewing any user profile */}
          <Route path="user/:userId" element={<ProfilePage />} /> 
        </Route>
        {/* ... Guest Routes ... */}
      </Routes>
    </React.Suspense>
  );
}
export default Router;
```

Next, update `src/pages/HomePage.jsx` to use the new `Profile` component in its first tab:

```jsx
// src/pages/HomePage.jsx
import React, { useState } from "react";
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, UserPlus, Mail, Users } from "lucide-react";

// Import components needed for tabs
import Profile from "@/features/user/Profile"; // *** Import the new Profile component ***
import ProfileCover from "@/features/user/ProfileCover";
import FriendList from "@/features/friend/FriendList"; // Placeholder for now
import FriendRequests from "@/features/friend/FriendRequests"; // Placeholder
import AddFriend from "@/features/friend/AddFriend"; // Placeholder

function HomePage() {
  const { user, isInitialized } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");

  if (!isInitialized) { /* ... loading ... */ }
  if (!user) { /* ... user loading placeholder ... */ }

  // Define the tabs structure, using the new Profile component for the first tab
  const PROFILE_TABS = [
    {
      value: "profile",
      icon: <User className="w-5 h-5" />,
      // *** Use the Profile component, passing the user data ***
      component: <Profile profile={user} />,
      label: "Profile"
    },
    {
      value: "friends",
      icon: <Users className="w-5 h-5" />,
      component: <FriendList />, 
      label: "Friends"
    },
    {
      value: "requests",
      icon: <Mail className="w-5 h-5" />,
      component: <FriendRequests />, 
      label: "Requests"
    },
    {
      value: "add_friend",
      icon: <UserPlus className="w-5 h-5" />,
      component: <AddFriend />,
      label: "Add Friend"
    },
  ];

  return (
    <div className="container mx-auto px-4 pt-4">
      {/* Cover and tabs card */}
      <Card className="mb-6 h-60 md:h-80 relative overflow-hidden shadow-sm">
        <ProfileCover profile={user} />
        {/* Tab Navigation (Keep as is) */}
        <div className="absolute bottom-0 ...">
          <Tabs value={currentTab} onValueChange={setCurrentTab} ...>
            <TabsList ...>
              {PROFILE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} ...>
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Tab content */}
      <Card className="p-4 md:p-6 shadow-sm">
        <Tabs value={currentTab} className="w-full">
          {PROFILE_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {/* Render the component associated with the active tab */}
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
export default HomePage;
```

## 9. Running the Application

Run `npm run dev` and test:

1.  **Your Profile (HomePage):** Log in and view the default `HomePage`. The "Profile" tab should be active, showing the `PostForm` and a list of *your* posts.
2.  **Edit Profile:** Click your user avatar in the header, go to "Your Profile" (this leads to `/user/yourUserId`). Click the "Edit Profile" button. The `ProfileEditForm` should appear in the "About" tab. Make changes and save. Verify the profile updates (you might need to refresh or wait for cache invalidation).
3.  **View Other Profile:** Find another user ID from `mockApi/data.js` (e.g., `user2`). Navigate directly to `/user/user2`. You should see their profile (`ProfilePage`), including their posts and about info. The "Edit Profile" button should *not* be visible. The "Add Friend" button should be visible (though non-functional).

## Summary

In this step, we've:

*   Set up React Query for server state management.
*   Created hooks (`useUserQuery`, `useUserPosts`, `useUpdateProfile`) for fetching and updating user data.
*   Built the `ProfilePage` for viewing any user's profile via `/user/:userId`.
*   Built `ProfileAbout` and `ProfileEditForm` for displaying and editing profile details.
*   Created a dedicated `Profile` component for the current user's view within the `HomePage` "Profile" tab, including their `PostForm` and posts.
*   Integrated these components into the routing and `HomePage` structure.

Users can now view profiles and edit their own information. Next, we'll focus on implementing the post creation and feed functionality in more detail.