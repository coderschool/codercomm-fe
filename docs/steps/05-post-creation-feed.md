# Step 5: Post Creation and Feed

In this step, we'll implement the core social feed functionality:

1.  **Creating New Posts:** Build a form for users to share content.
2.  **Displaying the Feed:** Fetch and display posts from the user and their friends using infinite scrolling.
3.  **Post Interactions:** Enable liking/unliking and deleting posts.

We'll heavily rely on React Query hooks created in this step to manage the post data.

## 1. Install Intersection Observer Library

For infinite scrolling (loading more posts as the user scrolls down), we'll use the `react-intersection-observer` library. Install it:

```bash
npm install react-intersection-observer
```

## 2. Understanding the Mock API Endpoints for Posts

Let's clarify the mock API endpoints relevant to this step:

*   `GET /api/posts?page=X&limit=Y`: Fetches a paginated list of posts for the main feed (user1 + friends).
*   `POST /api/posts`: Creates a new post (requires `content` and optional `image` in the body).
*   `POST /api/reactions`: Creates or updates a reaction (like) on a post or comment. Takes `{ targetType, targetId, emoji }` in the body. Handles toggling likes off if the same reaction is sent again.
*   `DELETE /api/posts/:postId`: Deletes a post owned by the current user (`user1` in the mock).

Note that our mock API `/reactions` endpoint handles both liking and unliking via a single `POST` request (it toggles). We will model our React Query hook accordingly.

## 3. Create Post Hooks with React Query

Encapsulate the logic for fetching, creating, reacting to, and deleting posts within custom React Query hooks.

Create `src/hooks/usePostQuery.js`:

```jsx
// src/hooks/usePostQuery.js
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

// --- Hook: usePostsQuery (Infinite Scroll) ---
/**
 * Fetches paginated posts for the main feed using infinite scrolling.
 * Uses React Query's `useInfiniteQuery`.
 */
export function usePostsQuery() {
  return useInfiniteQuery({
    // queryKey: Base key for this infinite query.
    queryKey: ["posts", "feed"], // Unique key for the feed posts
    
    // queryFn: Function to fetch a single page of data.
    // Receives an object containing `pageParam` (which we define below).
    queryFn: async ({ pageParam = 1 }) => {
      console.log(`Fetching posts page: ${pageParam}`);
      // Request posts for the given page number.
      const response = await apiService.get(`/posts?page=${pageParam}&limit=5`); // Use limit=5 for demo
      // Return the data structure expected by React Query, typically the API response data.
      // Our mock API returns { posts: [], count: X, totalPages: Y }
      return response.data;
    },
    
    // initialPageParam: The page number to fetch initially.
    initialPageParam: 1,
    
    // getNextPageParam: Function to determine the page number for the *next* fetch.
    // Receives the `lastPage` data (from the last successful queryFn call) 
    // and `allPages` data (array of all fetched pages).
    getNextPageParam: (lastPage, allPages) => {
      // Our API returns `totalPages`. If the current page number is less than totalPages, return the next page number.
      const currentPage = allPages.length; // Current number of pages fetched
      if (currentPage < lastPage.totalPages) {
        return currentPage + 1; // Return the next page number to fetch
      } else {
        return undefined; // No more pages to load
      }
    },
  });
}

// --- Hook: useCreatePost ---
/**
 * Provides a mutation function to create a new post.
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      // postData should contain { content: string, image?: string }
      console.log("Creating post:", postData);
      const response = await apiService.post('/posts', postData);
      return response.data; // Return the newly created post
    },
    onSuccess: (newPost) => {
      console.log("Post created successfully:", newPost);
      // --- Cache Update Strategy: Invalidate Feed Query ---
      // After creating a post, the feed data is stale.
      // Invalidate the entire feed query to trigger a refetch from page 1.
      // This ensures the new post appears at the top.
      // Note: This is simpler than manually inserting the new post into the cache.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      
      // Optional: Could also invalidate the user-specific posts query for the author
      // if (newPost.author?._id) {
      //   queryClient.invalidateQueries({ queryKey: ["posts", "user", newPost.author._id] });
      // }
      
      toast.success("Post created successfully");
    },
    onError: (error) => {
      console.error("Failed to create post:", error);
      toast.error(error.message || "Failed to create post");
    },
  });
}

// --- Hook: useReactToPost ---
/**
 * Provides a mutation function to react (like/unlike) a post.
 * Uses the single POST /reactions endpoint from the mock API.
 */
export function useReactToPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, emoji }) => {
      // The API expects targetType, targetId, emoji
      console.log(`Reacting to Post ${postId} with ${emoji}`);
      const response = await apiService.post('/reactions', {
        targetType: 'Post',
        targetId: postId,
        emoji: emoji,
      });
      // The mock API returns the updated list of reactions for the target
      return { postId, updatedReactions: response.data }; 
    },
    onSuccess: ({ postId, updatedReactions }) => {
      console.log(`Reaction successful for Post ${postId}:`, updatedReactions);
      // --- Cache Update Strategy: Invalidate Feed Query ---
      // Since the reaction count changes, invalidate the feed.
      // This is simpler than manually updating the reaction count/array within the infinite query cache.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      
      // Optional: Could also invalidate user-specific post lists if needed
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
      // toast.success("Reaction updated"); // Optional: notification for reaction
    },
    onError: (error) => {
      console.error("Failed to react to post:", error);
      toast.error(error.message || "Failed to update reaction");
    },
  });
}

// --- Hook: useDeletePost ---
/**
 * Provides a mutation function to delete a post.
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      console.log(`Deleting post: ${postId}`);
      // DELETE requests often don't return a body, just a status code (e.g., 204)
      await apiService.delete(`/posts/${postId}`);
      return postId; // Return the postId for potential cache updates
    },
    onSuccess: (postId) => {
      console.log(`Post ${postId} deleted successfully`);
      // --- Cache Update Strategy: Invalidate Feed Query ---
      // After deleting a post, invalidate the feed query to remove it.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });

      // Optional: Remove the post directly from the cache for a faster UI update
      // This is more complex with infinite queries.
      // queryClient.setQueryData(["posts", "feed"], (oldData) => ... remove post ... );

      // Also invalidate user-specific post lists if needed
      // We need the author ID for this, which isn't returned by the DELETE response.
      // Could potentially get it from the cache before invalidating if needed.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Failed to delete post");
    },
  });
}
```

**Explanation:**

*   **`useInfiniteQuery`**: Used for fetching data in chunks (pages) for infinite lists.
    *   `queryKey`: Must uniquely identify the *entire* list (`["posts", "feed"]`).
    *   `queryFn`: Fetches *one page* based on the `pageParam`.
    *   `initialPageParam`: Sets the starting page number (usually 1).
    *   `getNextPageParam`: Crucial function that tells React Query *how to get the next page number* based on the data from the *last fetched page*. If there are no more pages, it returns `undefined`.
*   **`useCreatePost`**: Uses `useMutation`. On success, it *invalidates* the `["posts", "feed"]` query. This tells React Query the feed data is stale, forcing a refetch, which will include the new post at the top.
*   **`useReactToPost`**: Uses `useMutation` to call the `POST /reactions` endpoint. On success, it also invalidates the `["posts", "feed"]` query to update the like count/state in the UI.
*   **`useDeletePost`**: Uses `useMutation`. On success, invalidates the `["posts", "feed"]` query to remove the deleted post from the UI.
*   **Invalidation Strategy**: For simplicity in this tutorial, we use `invalidateQueries` after mutations. This is robust but means the entire feed refetches. More advanced techniques involve *optimistic updates* or *manual cache manipulation* (`queryClient.setQueryData`) for a smoother UI, but add complexity.

## 4. Create Post Creation Component

This component provides the form for users to create new posts.

Create `src/features/post/PostForm.jsx`:

```jsx
// src/features/post/PostForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Components
import useAuth from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/usePostQuery"; // Import the mutation hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Image, Send } from "lucide-react";

// Utilities
import { getInitials } from "@/utils/formatters"; // Import utility

/**
 * Yup validation schema for the new post form.
 */
const postSchema = yup.object({
  // Require content, allow optional image later
  content: yup.string().required("Post content cannot be empty.").trim(),
  // image: yup.string().url("Invalid image URL"), // Add later if implementing image uploads
}).required();

/**
 * Form component for creating a new post.
 * Uses React Hook Form, Yup for validation, and useCreatePost mutation.
 */
function PostForm() {
  const { user } = useAuth(); // Get current user for avatar and name
  // Get the mutation function and its status from the hook
  const { mutate: createPostMutate, isPending: isCreatingPost } = useCreatePost();
  
  // Initialize React Hook Form
  const form = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      content: "",
      // image: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    console.log("Submitting post:", data);
    try {
      // Call the mutation function with the form data
      await createPostMutate(data, {
        onSuccess: () => {
          // Reset the form only after successful submission
          form.reset(); 
        }
      });
    } catch (error) {
      // Error handling is mostly done within the useCreatePost hook (toast)
      console.error("Error submitting post form:", error);
      // Optionally set form-specific errors here if needed
      // form.setError("root", { message: error.message });
    }
  };

  // Get user's first name for placeholder
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <Card className="mb-6 shadow-sm">
      <Form {...form}> {/* Pass form context */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Link to={`/user/${user?._id}`} className="flex-shrink-0 mt-1">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1">
                {/* Content Textarea Field */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel className="sr-only">Post Content</FormLabel> */}
                      <FormControl>
                        <Textarea
                          placeholder={`What's on your mind, ${firstName}?`}
                          className="resize-none min-h-[80px] border-none focus-visible:ring-0 shadow-none p-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="px-2" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t px-4 py-3">
            {/* Add Image Button (Placeholder) */}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary" 
              onClick={() => toast.info("Image upload coming soon!")}
            >
              <Image className="h-5 w-5 mr-2" />
              Add Image
            </Button>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isCreatingPost} // Disable while submitting
              size="sm"
            >
              {isCreatingPost ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
              ) : (
                  <><Send className="h-4 w-4 mr-2" /> Post</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Need to import Link from react-router-dom and Loader2 from lucide-react
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default PostForm;
```

**Explanation:**

*   Uses `useAuth` to get the current user for the avatar.
*   Uses the `useCreatePost` hook to get the `mutate` function (`createPostMutate`) and the pending state (`isCreatingPost`).
*   Uses `react-hook-form` and Yup for form state management and validation.
*   The `onSubmit` handler calls `createPostMutate` with the form data.
*   The form is reset via `form.reset()` only within the `onSuccess` callback of the mutation to ensure it clears only after a successful API call.
*   The submit button is disabled while `isCreatingPost` is true.

## 5. Enhance the Post List Component for Interactions

Update `src/features/post/PostList.jsx` to handle liking, unliking (via the `useReactToPost` hook), and deleting posts. Also ensure it uses imported utilities.

```jsx
// src/features/post/PostList.jsx
import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns"; // Use date-fns
import { MessageSquare, Heart, MoreVertical, Trash2, Loader2 } from "lucide-react"; // Import icons
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"; // Use Card
import { getInitials } from "@/utils/formatters"; // Import utility
import { Button } from "@/components/ui/button"; // Import Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown
import useAuth from "@/hooks/useAuth"; // Import useAuth
// Import post hooks
import { useReactToPost, useDeletePost } from "@/hooks/usePostQuery"; 
import { cn } from "@/lib/utils"; // Import cn for conditional classes

/**
 * Displays a list of posts with interaction buttons (like, comment, delete).
 */
function PostList({ posts = [] }) {
  const { user: currentUser } = useAuth();
  // Get mutation functions and their states
  const { mutate: reactToPostMutate, isPending: isReacting } = useReactToPost(); 
  const { mutate: deletePostMutate, isPending: isDeleting } = useDeletePost();

  // State to keep track of which post's delete action is pending
  const [deletingPostId, setDeletingPostId] = useState(null);

  const handleReaction = (postId, emoji) => {
    // Prevent reacting while another reaction is in progress (optional)
    // if (isReacting) return;
    reactToPostMutate({ postId, emoji });
  };

  const handleDeleteClick = (postId) => {
    if (isDeleting) return; // Prevent multiple delete clicks
    if (window.confirm("Are you sure you want to delete this post?")) {
      setDeletingPostId(postId); // Set which post is being deleted
      deletePostMutate(postId, {
          onSettled: () => setDeletingPostId(null) // Clear deleting state regardless of success/error
      });
    }
  };

  // Handle empty state
  if (!posts || posts.length === 0) {
    return (
      <Card className="mt-4 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            No posts to display yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
          // Determine if the current user liked this post
          const isLikedByCurrentUser = post.reactions?.some(
              (reaction) => reaction.author._id === currentUser?._id && reaction.emoji === 'like'
          );
          // Check if this specific post is being deleted
          const isCurrentlyDeleting = isDeleting && deletingPostId === post._id;

          return (
            <Card key={post._id} className={cn("overflow-hidden shadow-sm", isCurrentlyDeleting && "opacity-50 pointer-events-none")}> 
              <CardHeader className="p-0">
                {/* Post Author Info & Delete Menu */}
                <div className="flex items-center justify-between p-4">
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                        <Link to={`/user/${post.author._id}`} className="flex-shrink-0">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={post.author.avatarUrl || ''} alt={post.author.name} />
                                <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="ml-0">
                            <Link 
                                to={`/user/${post.author._id}`}
                                className="text-sm font-semibold hover:underline"
                            >
                                {post.author.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    {/* Post Menu Dropdown (only for post author) */}
                    {currentUser?._id === post.author._id && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isCurrentlyDeleting}>
                                {isCurrentlyDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="h-4 w-4" />
                                )}
                                <span className="sr-only">Post options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {/* Add Edit option later */}
                        {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
                        <DropdownMenuItem 
                            onClick={() => handleDeleteClick(post._id)}
                            className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                            disabled={isCurrentlyDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                </div>
              </CardHeader>
              
              <CardContent className="px-4 pb-2 pt-0">
                {/* Post Content */}
                {post.content && (
                  <p className="text-sm whitespace-pre-wrap mb-3">
                    {post.content}
                  </p>
                )}
                
                {/* Post Image (if exists) */}
                {post.image && (
                  <div className="mt-2 -mx-4 sm:mx-0 rounded-md overflow-hidden border">
                    <img 
                      src={post.image} 
                      alt="Post attachment" 
                      className="max-h-[500px] w-full object-cover aspect-video" 
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="px-4 py-2 bg-muted/50 border-t">
                {/* Post Actions/Stats */}
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {/* Like Button */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleReaction(post._id, 'like')} // Use generic handler
                        disabled={isReacting} // Disable while any reaction is pending
                        className={cn(
                            "flex items-center gap-1 hover:text-primary px-2",
                            isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                      <Heart className={cn("h-4 w-4", isLikedByCurrentUser && 'fill-primary')} />
                      {/* Display optimistic count or actual count */}
                      <span>{post.reactions?.filter(r => r.emoji === 'like').length || 0}</span> 
                      <span className="sr-only">Likes</span>
                    </Button>
                    {/* Comment Button (no action yet) */}
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-primary px-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.commentCount || 0}</span>
                      <span className="sr-only">Comments</span>
                    </Button>
                  </div>
                  {/* Add Share button/count later */}
                </div>
              </CardFooter>
            </Card>
          )
      })}
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }).isRequired,
    reactions: PropTypes.array, // Array of reaction objects
    commentCount: PropTypes.number, 
  })),
};

export default PostList;
```

**Explanation:**

*   Imports `useReactToPost` and `useDeletePost`.
*   Gets `currentUser` from `useAuth` to check ownership for delete and like status.
*   `handleReaction`: Calls `reactToPostMutate` with the necessary data.
*   `handleDeleteClick`: Calls `deletePostMutate` after confirmation.
*   **Like Button Logic**: Determines `isLikedByCurrentUser` by checking the `post.reactions` array. The button's appearance (`text-primary`, `fill-primary`) is conditionally set based on this. Clicking the button always sends a 'like' reaction; the backend/mock API handles toggling.
*   **Delete Button Logic**: Only shown if `currentUser._id === post.author._id`. Uses a dropdown menu for the delete action.
*   **Loading States**: Uses `isReacting` and `isDeleting` from the mutation hooks to disable buttons during API calls and optionally show loading indicators (e.g., on the delete button).

## 6. Create Feed Component with Infinite Scrolling

This component fetches the main feed using `useInfiniteQuery` and implements infinite scrolling using `react-intersection-observer`.

Create `src/features/post/Feed.jsx`:

```jsx
// src/features/post/Feed.jsx
import React, { useEffect, useRef } from "react";
import { usePostsQuery } from "@/hooks/usePostQuery"; // Import the infinite query hook
import PostList from "./PostList"; // The component to render posts
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer"; // Hook for detecting visibility
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Feed Component:
 * - Fetches feed posts using usePostsQuery (infinite query).
 * - Implements infinite scrolling using react-intersection-observer.
 * - Handles loading and error states.
 */
function Feed() {
  // Use the infinite query hook
  const { 
    data,           // Data object (contains pages array)
    fetchNextPage,  // Function to fetch the next page
    hasNextPage,    // Boolean indicating if there are more pages
    isLoading,      // Is the initial page loading?
    isFetchingNextPage, // Is the next page currently being fetched?
    isError,        // Was there an error fetching?
    error           // The error object
  } = usePostsQuery();
  
  // --- Infinite Scroll Setup ---
  // `useInView` returns a ref and a boolean `inView`.
  // Attach the `ref` to an element near the bottom of the list.
  // `inView` becomes true when that element enters the viewport.
  const { ref: loadMoreRef, inView } = useInView({
      threshold: 0.5, // Trigger when 50% of the element is visible
      triggerOnce: false // Trigger every time it enters view
  });

  // Effect to fetch the next page when the `loadMoreRef` element becomes visible
  useEffect(() => {
    // Only fetch if the trigger element is in view, there's a next page, and not already fetching
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Load more trigger in view, fetching next page...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Render Logic ---

  // Initial loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading feed...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Feed</AlertTitle>
        <AlertDescription>
          {error?.message || "Could not load posts. Please try again later."}
        </AlertDescription>
        {/* Optional: Add a retry button */}
        {/* <Button onClick={() => refetch()} variant="destructive" size="sm" className="mt-2">Retry</Button> */}
      </Alert>
    );
  }

  // --- Prepare Posts Data ---
  // `data.pages` is an array where each element is the result from fetching one page.
  // `flatMap` combines the `posts` array from each page into a single flat array.
  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="space-y-4">
      {/* Render the list of posts */}
      <PostList posts={posts} /> 
      
      {/* --- Load More Trigger & Indicator --- */}
      {/* Display only if there are more pages */} 
      {hasNextPage && (
        <div 
          ref={loadMoreRef} // Attach the ref here
          className="flex justify-center p-6 mt-4" 
        >
          {/* Show loading spinner only when fetching the next page */}
          {isFetchingNextPage && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
          {/* Add a placeholder element to ensure the ref trigger has height even when not loading */}
          {!isFetchingNextPage && <div className="h-1 w-1" />} 
        </div>
      )}
      
      {/* Optional: Message when all posts are loaded */}
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center p-6 mt-4 text-sm text-muted-foreground">
          You've reached the end of the feed.
        </div>
      )}
    </div>
  );
}

export default Feed;
```

**Explanation:**

*   **`usePostsQuery`**: Fetches the feed data using the infinite query hook.
*   **`useInView`**: Provides a `loadMoreRef`. This `ref` is attached to a `div` at the bottom of the list.
*   **`useEffect`**: Watches the `inView` boolean. When it becomes `true` (meaning the `loadMoreRef` div is visible), and if there `hasNextPage` and it's not already `isFetchingNextPage`, it calls `fetchNextPage()` from `usePostsQuery`.
*   **Flattening Pages**: React Query's `useInfiniteQuery` stores data in `data.pages`, an array of page results. We use `flatMap` to create a single array of all posts from all fetched pages to pass to `PostList`.
*   **Loading Indicators**: Shows an initial loading spinner (`isLoading`) and a smaller spinner when fetching subsequent pages (`isFetchingNextPage`).

## 7. Update the Home Page

Modify `src/pages/HomePage.jsx` to include the `PostForm` and the `Feed`.

```jsx
// src/pages/HomePage.jsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import PostForm from "@/features/post/PostForm"; // Import PostForm
import Feed from "@/features/post/Feed"; // Import Feed
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Home Page Component:
 * Displays the Post Creation form and the main Feed.
 */
function HomePage() {
  const { user, isInitialized } = useAuth();

  // Show loading screen only if auth isn't initialized yet
  // Feed component will handle its own loading state
  if (!isInitialized) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Content Area (Feed and Post Form) */}
      <div className="col-span-12 lg:col-span-8">
        {/* Only show PostForm if user is loaded */}
        {user && <PostForm />} 
        <Feed />
      </div>

      {/* Sidebar/Widgets Area (Placeholder) */}
      <div className="hidden lg:block lg:col-span-4">
        <div className="sticky top-20 space-y-6">
          {/* Add Friend Suggestions, Trending Topics etc. later */}
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Suggestions</h3>
            <p className="text-sm text-muted-foreground">Friend suggestions or trending topics could go here.</p>
          </div>
           <div className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Advertisement</h3>
            <p className="text-sm text-muted-foreground">Placeholder for ads or other widgets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
```

**Explanation:**

*   Imports and renders `PostForm` at the top of the main content area.
*   Renders the `Feed` component below the form.
*   Includes a placeholder for a right sidebar area on larger screens (`lg:col-span-4`).

## 8. Running the Application

Now you have post creation and an infinite scrolling feed!

```bash
npm run dev
```

**Things to Test:**

1.  Go to the home page after logging in.
2.  Create a new post using the form at the top.
3.  Verify your new post appears immediately at the top of the feed (due to query invalidation).
4.  Like/Unlike posts. Observe the like count and button state update (after a brief delay for refetch).
5.  Delete one of your own posts using the dropdown menu on the post.
6.  Scroll down the feed. As you approach the bottom, a loading spinner should appear briefly, and more posts should load.
7.  Continue scrolling until the "You've reached the end" message appears.

## 9. Frequently Asked Questions (FAQ)

*   **Q: How does `useInfiniteQuery` work?**
    *   A: It's designed for lists that load in pages. It fetches the first page (`initialPageParam`), and then the `getNextPageParam` function tells it how to get the *next* page number. `fetchNextPage` triggers fetching that next page. All fetched pages are stored in `data.pages`.
*   **Q: What's the difference between `isLoading` and `isFetchingNextPage`?**
    *   A: `isLoading` is true only for the *initial* fetch of the first page. `isFetchingNextPage` is true when `fetchNextPage` has been called and the *subsequent* page request is in progress.
*   **Q: Why invalidate the whole query on like/delete instead of updating the cache manually?**
    *   A: Manual cache updates (`queryClient.setQueryData`) for infinite queries can be complex, as you need to find the correct post within the nested `data.pages` array structure. Invalidation (`queryClient.invalidateQueries`) is simpler and more robust, although it causes a full refetch of the feed. For this tutorial, simplicity is preferred.
*   **Q: How does `react-intersection-observer` (`useInView`) trigger loading?**
    *   A: You attach the `ref` it provides to an element (usually near the end of your list). When that element scrolls into the viewport (`inView` becomes true), the `useEffect` hook detects this change and calls `fetchNextPage` (if conditions like `hasNextPage` are met).
*   **Q: Why reset the `PostForm` inside the `onSuccess` callback of `mutateAsync`?**
    *   A: This ensures the form only clears *after* the post has been successfully created (the API call returned success). If we reset it immediately in `onSubmit`, the form might clear even if the API call fails.

## What's Next?

Great job! You've implemented the core feed mechanics. 

In **Step 6: Comments System**, we'll add the ability to:

1.  View comments associated with a post.
2.  Create new comments.
3.  Implement comment interactions (liking, replying - optional).

This will complete the core social interaction features of the CoderComm platform. 