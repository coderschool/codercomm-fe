# Step 4: User Profile System

In this step, we'll implement a user profile system that allows users to view and edit their profiles. We'll create comprehensive profile pages that display user information and allow for profile updates.

## 1. Understanding the Mock API Endpoints for User Profiles

Our mock API already includes all the endpoints we need for user profiles. For this step, we'll be using the following endpoints:

- `GET /api/users/me` - Get the current user's profile information
- `GET /api/users/:id` - Get a specific user's profile by ID
- `PUT /api/users/:id` - Update a user's profile
- `GET /api/posts/user/:userId` - Get posts created by a specific user

Remember that you don't need to modify the mock API - it's already set up with all the functionality we need. We just need to create the frontend components to interact with these endpoints.

## 2. Install Additional UI Components

Let's install additional ShadCN UI components that we'll need for the profile system:

```bash
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add alert
```

## 3. Create User Service with React Query Hooks

Create a new file `src/hooks/useUserQuery.js`:

```jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

/**
 * Get a user by ID
 * @param {string} userId - ID of the user to fetch
 */
export function useUserQuery(userId) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const response = await apiService.get(`/users/${userId}`);
      return response;
    },
    enabled: !!userId,
  });
}

/**
 * Update user profile
 * @returns {Object} - Mutation object for updating a user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await apiService.put(`/users/${userId}`, userData);
      return response;
    },
    onSuccess: (data, { userId }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      
      // If it's the current user, update in store
      const currentUser = queryClient.getQueryData(["users", "me"]);
      if (currentUser && currentUser._id === userId) {
        queryClient.setQueryData(["users", "me"], data);
      }
      
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

/**
 * Get posts by a specific user
 * @param {string} userId - ID of the user whose posts to fetch
 */
export function useUserPosts(userId) {
  return useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: async () => {
      const response = await apiService.get(`/posts/user/${userId}`);
      return response;
    },
    enabled: !!userId,
  });
}
```

## 4. Create a Profile Page Component

Create a new component for displaying user profiles in `src/pages/ProfilePage.jsx`:

```jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useUserQuery, useUserPosts } from "@/hooks/useUserQuery";
import useAuth from "@/hooks/useAuth";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, UserPlus, UserMinus, Calendar } from "lucide-react";
import ProfileAbout from "@/features/user/ProfileAbout";
import ProfileEditForm from "@/features/user/ProfileEditForm";
import PostList from "@/features/post/PostList";
import LoadingScreen from "@/components/LoadingScreen";
import { formatDistanceToNow } from "date-fns";

/**
 * User profile page
 */
function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [editing, setEditing] = React.useState(false);
  
  const { 
    data: user, 
    isLoading,
    isError,
    error
  } = useUserQuery(id);
  
  const { 
    data: postsData, 
    isLoading: postsLoading 
  } = useUserPosts(id);

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

  const isCurrentUser = currentUser?._id === id;

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded">
        <h2 className="font-bold text-lg">Error loading profile</h2>
        <p>{error.message || "Failed to load user profile"}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cover Image and Profile Info */}
      <div className="relative mb-8">
        <div className="h-56 rounded-lg overflow-hidden bg-muted">
          {user.coverUrl ? (
            <img
              src={user.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
          )}
        </div>

        <div className="absolute -bottom-6 left-6 flex items-end">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="ml-4 mb-2">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Joined {formatDistanceToNow(new Date("2023-01-01"), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className="absolute right-6 bottom-6">
          {isCurrentUser ? (
            <Button 
              onClick={() => setEditing(!editing)} 
              variant={editing ? "secondary" : "default"}
            >
              <Pencil className="h-4 w-4 mr-2" />
              {editing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          ) : (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {postsLoading ? (
              <LoadingScreen message="Loading posts..." fullScreen={false} />
            ) : (
              <PostList posts={postsData?.posts || []} />
            )}
          </TabsContent>
          
          <TabsContent value="about">
            {editing && isCurrentUser ? (
              <ProfileEditForm 
                user={user} 
                onCancel={() => setEditing(false)} 
                onSuccess={() => setEditing(false)}
              />
            ) : (
              <ProfileAbout user={user} />
            )}
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="bg-card p-6 rounded-lg">
              <p className="text-center text-muted-foreground py-8">
                Friends list will be implemented in a future step.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="photos">
            <div className="bg-card p-6 rounded-lg">
              <p className="text-center text-muted-foreground py-8">
                Photos gallery will be implemented in a future step.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfilePage;
```

## 5. Create User Feature Components

Create a component to display user information in `src/features/user/ProfileAbout.jsx`:

```jsx
import React from "react";
import { Mail, MapPin, Briefcase, Heart, Link } from "lucide-react";

/**
 * Component to display a user's profile details
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 */
function ProfileAbout({ user }) {
  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">About</h2>
      
      <div className="mb-6">
        <p className="text-muted-foreground leading-relaxed">
          {user.aboutMe || "No information provided."}
        </p>
      </div>
      
      <div className="space-y-4">
        {user.email && (
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
        )}
        
        {user.location && (
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{user.location}</span>
          </div>
        )}
        
        {user.occupation && (
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{user.occupation}</span>
          </div>
        )}
        
        {user.relationship && (
          <div className="flex items-center">
            <Heart className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{user.relationship}</span>
          </div>
        )}
        
        {user.website && (
          <div className="flex items-center">
            <Link className="h-5 w-5 mr-3 text-muted-foreground" />
            <a 
              href={user.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {user.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileAbout;
```

Create a component for editing profile information in `src/features/user/ProfileEditForm.jsx`:

```jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdateProfile } from "@/hooks/useUserQuery";

// Form validation schema
const profileSchema = yup.object({
  name: yup.string().required("Name is required"),
  aboutMe: yup.string(),
  avatarUrl: yup.string().url("Must be a valid URL").nullable(),
  coverUrl: yup.string().url("Must be a valid URL").nullable(),
}).required();

/**
 * Component to edit user profile information
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user data
 * @param {Function} props.onCancel - Function to call when canceling edit
 * @param {Function} props.onSuccess - Function to call after successful update
 */
function ProfileEditForm({ user, onCancel, onSuccess }) {
  const updateProfile = useUpdateProfile();
  
  const form = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      aboutMe: user.aboutMe || "",
      avatarUrl: user.avatarUrl || "",
      coverUrl: user.coverUrl || ""
    }
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile.mutateAsync({
        userId: user._id,
        userData: data
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      
      {updateProfile.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {updateProfile.error.message || "Failed to update profile"}
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="aboutMe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell others about yourself" 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/your-avatar.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a URL for your profile picture
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coverUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/your-cover.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a URL for your profile cover image
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={updateProfile.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ProfileEditForm;
```

## 6. Create a Basic Post List Component

Create a component to display a list of posts in `src/features/post/PostList.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart } from "lucide-react";

/**
 * Component to display a list of posts
 * @param {Object} props - Component props
 * @param {Array} props.posts - List of posts to display
 */
function PostList({ posts = [] }) {
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

  if (posts.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg text-center">
        <p className="text-muted-foreground py-8">No posts to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post._id} className="bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Link to={`/user/${post.author._id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="ml-3">
              <Link 
                to={`/user/${post.author._id}`}
                className="font-medium hover:underline"
              >
                {post.author.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="flex items-center mr-4">
              <Heart className="h-4 w-4 mr-1" />
              <span>{post.likes} likes</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.comments} comments</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
```

## 7. Update Routes to Include the Profile Page

Update the router configuration in `src/routes/index.jsx`:

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
import ProfilePage from "../pages/ProfilePage";

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
        <Route path="user/:id" element={<ProfilePage />} />
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

## 8. Update the Sidebar and Header Components

Update the sidebar user link to point to the user's profile in `src/layouts/Sidebar.jsx`. Find the part with the user avatar and update it:

```jsx
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
```

Update the header dropdown menu to point to the user's profile in `src/layouts/MainHeader.jsx`:

```jsx
<DropdownMenuItem asChild>
  <Link to={`/user/${user?._id}`} className="cursor-pointer">
    <UserCircle className="h-4 w-4 mr-2" />
    Your Profile
  </Link>
</DropdownMenuItem>
```

## 9. Update the Account Page with a Link to Profile

Update the `AccountPage` component to link to the user's profile:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

/**
 * Account settings page
 */
function AccountPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
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
          <Button asChild>
            <Link to={`/user/${user?._id}`}>
              <UserCircle className="h-4 w-4 mr-2" />
              View Full Profile
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="bg-blue-50 text-blue-700 p-4 rounded">
          In the full implementation, this page would include form fields to update your account settings, change your password, and manage notification preferences.
        </p>
      </div>
    </div>
  );
}

export default AccountPage;
```

## 10. Running the Application

With the user profile system implemented, start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`, log in, and try these features:

1. View your own profile by clicking on your avatar in the sidebar or from the dropdown menu
2. Edit your profile information by clicking "Edit Profile" on your profile page
3. Update your name, about me section, and profile/cover image URLs

## What's Next?

In the next step, we'll implement the post creation and feed system, including:

1. Creating a form for users to compose and submit posts
2. Displaying posts in the home feed
3. Adding like and comment functionality
4. Implementing pagination for the feed

This will allow users to share their thoughts and interact with content from others on the platform. 