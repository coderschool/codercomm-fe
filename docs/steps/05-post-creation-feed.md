# Step 5: Post Creation & Feed Display

In this step, we'll implement the core functionality for users to create posts and view a simple feed. This involves:

1.  **Building the Post Form:** Creating the `PostForm` component to submit new posts via `apiService`.
2.  **Building Post Display Components:** Creating `PostCard` to display a single post and `PostList` to render a list of posts.
3.  **Fetching Feed Data:** Fetching the main post feed (`/api/posts`) in `HomePage` using `useEffect` and `apiService`.
4.  **Integrating Components:** Placing `PostForm` and `PostList` into `HomePage` and handling data flow and updates.

## 1. Add Required UI Components

Ensure you have the necessary ShadCN components. Add `dialog` for the delete confirmation.

```bash
npx shadcn-ui@latest add card avatar button textarea dropdown-menu alert dialog
```

## 2. Create Post Creation Component (`PostForm.jsx`)

This component allows the logged-in user to create a new post.

Create `src/features/post/PostForm.jsx`:

```jsx
// src/features/post/PostForm.jsx
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppStore } from "@/lib/store"; // To get current user for avatar
import apiService from "@/lib/apiService"; // To make API call
import { toast } from "sonner";

// ShadCN UI
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Image as ImageIcon, Send } from "lucide-react"; // Icons
import { getInitials } from "@/utils/formatters";

// Validation Schema
const postSchema = yup.object({
  content: yup.string().required("Post content cannot be empty").max(500, "Post too long!"),
  // image: yup.string().url("Invalid image URL").nullable(), // Add later if needed
}).required();

/**
 * Form for creating a new post.
 */
function PostForm({ onPostCreated }) {
  const currentUser = useAppStore(state => state.currentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      content: "",
      // image: "",
    },
  });

  const { handleSubmit, reset, control } = form;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Add image upload logic here if implementing image uploads
      const postData = { content: data.content }; // Add image: data.image if needed
      
      // Use apiService directly
      const newPost = await apiService.post('/posts', postData);
      
      toast.success("Post created successfully!");
      reset(); // Clear the form
      if (onPostCreated) {
        onPostCreated(newPost); // Notify parent component
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      const errorMsg = err.message || "Failed to create post. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  return (
    <Card className="mb-6 shadow-sm">
      <Form {...form}>
        {/* Display general submission error if needed */} 
        {/* {error && <Alert variant="destructive">...</Alert>} */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-4 flex gap-3">
             {/* User Avatar */} 
            <Avatar className="hidden sm:block h-10 w-10 border">
              <AvatarImage src={currentUser?.avatarUrl || ''} alt={currentUser?.name} />
              <AvatarFallback>{getInitials(currentUser?.name)}</AvatarFallback>
            </Avatar>
            
            {/* Textarea Field */} 
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  {/* No visible label needed here */}
                  <FormControl>
                    <Textarea
                      placeholder={`What's on your mind, ${firstName}?`}
                      className="min-h-[80px] resize-none border-muted focus-visible:ring-1 focus-visible:ring-primary"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between border-t px-4 py-2">
             {/* Placeholder for adding image - functionality not implemented */}
            <Button type="button" variant="ghost" size="icon" disabled={true || isSubmitting} title="Add image (coming soon)">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Add image</span>
            </Button>
            
            {/* Submit Button */} 
            <Button type="submit" disabled={isSubmitting} size="sm">
              <Send className="h-4 w-4 mr-1.5" />
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

PostForm.propTypes = {
  onPostCreated: PropTypes.func, // Callback after successful creation
};

export default PostForm;

```

**Explanation:**

*   Uses RHF/Yup for the simple text area form.
*   Gets `currentUser` from `useAppStore` for the avatar.
*   `onSubmit` calls `apiService.post('/posts', ...)`.
*   Uses local `useState` for `isSubmitting` and `error`.
*   Calls the `onPostCreated` prop function on success, passing the newly created post data from the API response.

## 3. Create Post Display Components (`PostCard.jsx`, `PostList.jsx`)

We need a component to display a single post (`PostCard`) and one to list multiple posts (`PostList`).

Create `src/features/post/PostCard.jsx`:

```jsx
// src/features/post/PostCard.jsx
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from 'date-fns';
import { useAppStore } from "@/lib/store";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

// ShadCN UI & Icons
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';

// Utils
import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

/**
 * Displays a single post card with interactions.
 */
function PostCard({ post, onDeleteSuccess, onReactionSuccess }) {
  const currentUser = useAppStore(state => state.currentUser);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!post) return null;

  const isCurrentUserPost = currentUser?._id === post.author?._id;
  // Check if the current user has liked this post
  const isLiked = post.reactions?.some(r => r.author?._id === currentUser?._id && r.emoji === 'like');
  const likeCount = post.reactions?.filter(r => r.emoji === 'like').length || 0;

  // --- Like/Unlike Handler ---
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await apiService.post('/reactions', { 
        targetType: 'Post',
        targetId: post._id,
        emoji: 'like' // Hardcoding 'like' for this button
      });
      // Notify parent to refetch data or handle update optimistically
      if (onReactionSuccess) onReactionSuccess(post._id);
    } catch (error) {
      console.error("Failed to react to post:", error);
      toast.error(error.message || "Failed to update reaction");
    } finally {
      setIsLiking(false);
    }
  };

  // --- Delete Handlers ---
  const handleDelete = async () => {
    setShowDeleteConfirm(false); // Close dialog first
    if (isDeleting || !isCurrentUserPost) return;
    setIsDeleting(true);
    try {
      await apiService.delete(`/posts/${post._id}`);
      toast.success("Post deleted");
      if (onDeleteSuccess) onDeleteSuccess(post._id); // Notify parent
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Failed to delete post");
      setIsDeleting(false); // Reset deleting state on error
    }
    // No finally block needed for isDeleting, as component might unmount
  };

  const openDeleteConfirm = () => setShowDeleteConfirm(true);

  return (
    <Card className={cn("w-full shadow-sm", isDeleting && "opacity-50 pointer-events-none")}>
      {/* Card Header: Author Info + Options Dropdown */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b">
        <Link to={`/user/${post.author?._id}`} className="flex items-center gap-2 group">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={post.author?.avatarUrl || ''} alt={post.author?.name} />
            <AvatarFallback>{getInitials(post.author?.name)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium group-hover:text-primary transition-colors">{post.author?.name || "Unknown User"}</p>
            {post.createdAt && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </Link>
        
        {/* Delete Dropdown (only for own posts) */} 
        {isCurrentUserPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={openDeleteConfirm}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Post
              </DropdownMenuItem>
              {/* Add Edit option later if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      {/* Card Content: Post Text & Image */}
      <CardContent className="p-3 text-sm">
        <p className="whitespace-pre-wrap break-words">{post.content}</p>
        {post.image && (
          <div className="mt-3 rounded-md overflow-hidden border aspect-video bg-muted"> {/* Changed aspect ratio */} 
            <img 
              src={post.image}
              alt="Post image"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </CardContent>

      {/* Card Footer: Actions (Like, Comment) */}
      <CardFooter className="p-2 border-t flex justify-between items-center">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike} 
            disabled={isLiking || isDeleting}
            className={cn("flex items-center gap-1", isLiked && "text-red-500 hover:text-red-600")}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-xs">{likeCount}</span>
            <span className="sr-only">Like post</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground" disabled={true || isDeleting}> {/* Disable comments for now */}
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.commentCount || 0}</span>
            <span className="sr-only">Comment on post</span>
          </Button>
        </div>
        {/* Add Share button later if needed */}
      </CardFooter>

      {/* Delete Confirmation Dialog */} 
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    image: PropTypes.string,
    author: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    createdAt: PropTypes.string,
    reactions: PropTypes.array,
    commentCount: PropTypes.number,
  }).isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  onReactionSuccess: PropTypes.func.isRequired,
};

export default PostCard;
```

Create/Update `src/features/post/PostList.jsx`:

```jsx
// src/features/post/PostList.jsx
import React from "react";
import PropTypes from 'prop-types';
import PostCard from "./PostCard";
import { Card, CardContent } from "@/components/ui/card"; // For empty state

/**
 * Renders a list of PostCard components.
 */
function PostList({ posts = [], onDeleteSuccess, onReactionSuccess }) {
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
      {posts.map((post) => (
        <PostCard 
          key={post._id} 
          post={post} 
          onDeleteSuccess={onDeleteSuccess} 
          onReactionSuccess={onReactionSuccess}
        />
      ))}
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.array,
  onDeleteSuccess: PropTypes.func.isRequired,
  onReactionSuccess: PropTypes.func.isRequired,
};

export default PostList;
```

**Explanation:**

*   **`PostCard.jsx`**: Displays a single post, including author info, content, image (if any), and action buttons (Like, Comment placeholder, Delete).
    *   Handles like/unlike logic by calling `apiService.post('/reactions')`. Uses local state `isLiking`.
    *   Handles delete logic using `AlertDialog` for confirmation and calls `apiService.delete('/posts/:id')`. Uses local state `isDeleting`, `showDeleteConfirm`.
    *   Calls `onDeleteSuccess` or `onReactionSuccess` props after successful API calls to notify the parent.
*   **`PostList.jsx`**: Simple component that maps over the `posts` array and renders a `PostCard` for each, passing down the necessary props and callbacks.

## 4. Update `HomePage` for Feed and Post Creation

Modify `HomePage` to fetch the main feed, render `PostForm`, and `PostList`.

Update `src/pages/HomePage.jsx`:

```jsx
// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import apiService from "@/lib/apiService";

// Components
import PostForm from "@/features/post/PostForm";
import PostList from "@/features/post/PostList";
import LoadingScreen from "@/components/LoadingScreen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Home page: Displays PostForm and the main post feed.
 * Fetches feed data using useEffect/apiService.
 */
function HomePage() {
  const currentUser = useAppStore(state => state.currentUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts function (memoized)
  const fetchPosts = useCallback(async () => {
    // Don't set loading to true on refetch to avoid layout shifts
    // setLoading(true); 
    setError(null);
    console.log("HomePage: Fetching feed posts...");
    try {
      // Fetch the general feed posts
      const response = await apiService.get('/posts');
      // Assuming the interceptor returns the full object { posts, count, ... }
      setPosts(response.posts || []); 
      console.log("HomePage: Feed posts fetched.", response.posts?.length);
    } catch (err) {
      console.error("HomePage: Failed to fetch posts:", err);
      setError(err.message || "Could not load feed.");
      setPosts([]); // Clear posts on error
    } finally {
      // Only set initial loading to false
      if (loading) setLoading(false); 
    }
  }, [loading]); // Depend on `loading` to set it false only once

  // Initial fetch on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Run fetchPosts when the function instance changes (effectively once)

  // Handler for when a new post is created by PostForm
  // Also used for refreshing after delete/like
  const handleDataChange = () => {
    console.log("HomePage: Data changed (post created/deleted/liked), refetching posts...");
    fetchPosts(); // Refetch the entire posts list
    // More advanced: Could try to update state optimistically or only fetch updated post
  };

  // --- Render Logic ---
  if (loading) {
    return <LoadingScreen message="Loading feed..." />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6"> {/* Centered column layout */} 
      {/* Welcome message - optional */}
      {/* <h1 className="text-2xl font-semibold">Home Feed</h1> */} 
      
      {/* Post Creation Form */} 
      <PostForm onPostCreated={handleDataChange} />

      {/* Display Error if fetching failed */} 
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Feed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Post List */} 
      <PostList 
        posts={posts} 
        onDeleteSuccess={handleDataChange} 
        onReactionSuccess={handleDataChange} 
      />
    </div>
  );
}

export default HomePage;
```

**Explanation:**

*   Fetches posts for the main feed using `useEffect`, `useState`, and `apiService.get('/posts')`.
*   Includes `PostForm`, passing the `handleDataChange` callback function as the `onPostCreated` prop.
*   Includes `PostList`, passing the fetched `posts` array and the `handleDataChange` function for both `onDeleteSuccess` and `onReactionSuccess` props.
*   `handleDataChange` simply calls `fetchPosts()` again to refresh the entire list whenever a post is created, deleted, or liked. This is a simple strategy for ensuring data consistency.

## 5. Running the Application

Run `npm run dev` and test post functionality on the Home page:

1.  **Log in:** You should land on the `HomePage`.
2.  **View Feed:** You should see the `PostForm` at the top, followed by a list of posts from various users (user1, user2, user3 from mock data).
3.  **Create Post:** Use the `PostForm`, type a message, click "Post". A success toast should appear, the form should clear, and the new post should appear at the top of the `PostList` below (after the refetch completes).
4.  **Like Post:** Click the heart icon on any post. It should update visually (turn red) after the action completes and the list refetches.
5.  **Delete Own Post:** Find a post you just created. Click the ellipsis (...) and choose "Delete". Confirm the deletion. The post should be removed from the feed after the refetch.
6.  **Check Profile Page:** Navigate to your own profile page (`/user/user1`). The posts list there should also reflect the creation/deletion changes.

## 6. Frequently Asked Questions (FAQ)

*   **Q: How does the feed update after creating/deleting/liking a post?**
    *   A: The `PostForm` and `PostCard` components call callback functions (`onPostCreated`, `onDeleteSuccess`, `onReactionSuccess`) passed down from `HomePage`. These callbacks all trigger the `handleDataChange` function in `HomePage`, which in turn calls `fetchPosts()` again. This refetches the entire list of posts from `/api/posts` and updates the `posts` state, causing the `PostList` to re-render with the latest data.
*   **Q: Isn't refetching the whole list inefficient?**
    *   A: Yes, for large feeds, it can be. This is a simple approach for the tutorial. More advanced techniques include: updating the local state array directly (optimistic updates), only fetching the single updated/created post and merging it into the state, or using pagination/infinite scrolling (fetching only visible posts).
*   **Q: Why is the like button sometimes slow to update visually?**
    *   A: Because we are waiting for the API call (`apiService.post('/reactions', ...)`) to complete and then refetching the entire post list via `handleDataChange`. An optimistic update (changing the button's appearance *before* the API call finishes and reverting if it fails) would make it feel instantaneous.

## What's Next?

Users can now create posts and see a basic feed. The next essential feature is comments.

In **Step 6: Comments System**, we'll build the components and logic to allow users to view and add comments to posts.