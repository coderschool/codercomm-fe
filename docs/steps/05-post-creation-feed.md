# Step 5: Post Creation and Display

In this step, we'll implement the core functionality for users to create and interact with posts. This involves:

1.  **Creating Post Mutation Hooks:** Setting up React Query mutations for creating, liking/unliking, and deleting posts.
2.  **Building the Post Form:** Creating the `PostForm` component.
3.  **Building the Post List:** Creating/refining the `PostList` component to display posts and handle interactions.

These components and hooks will primarily be used within the `Profile` tab on `HomePage` (created in Step 4) and the `ProfilePage`.

## 1. Understanding the Mock API Endpoints for Posts

*   `GET /api/posts`: Fetches *all* posts. (Note: We are primarily using `GET /api/posts/user/:userId` via `useUserPosts` from Step 4 for current views).
*   `POST /api/posts`: Creates a new post.
*   `POST /api/reactions`: Creates or updates a reaction (like).
*   `DELETE /api/posts/:postId`: Deletes a post owned by the current user.

## 2. Create Post Hooks with React Query

Create or update `src/hooks/usePostQuery.js` to include the mutation hooks for creating, reacting to, and deleting posts. We will comment out the general `usePostsQuery` for now, as our current views rely on `useUserPosts` from the previous step.

```jsx
// src/hooks/usePostQuery.js
import {
  useMutation,
  useQueryClient,
  // useQuery, // Keep useQuery import if needed elsewhere
} from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth"; // Import useAuth

/* 
// --- Hook: usePostsQuery (Commented Out - Not currently used by HomePage/ProfilePage) ---
// Fetches all posts for a potential global feed page.
// Our current Profile/ProfilePage views use useUserPosts (from useUserQuery.js).
export function usePostsQuery() {
  const { isAuthenticated, isInitialized } = useAuth();
  return useQuery({
    queryKey: ["posts", "feed"], 
    queryFn: async () => {
      console.log(`Fetching all feed posts`);
      const response = await apiService.get(`/posts`); 
      return response.posts || []; 
    },
    enabled: isInitialized && isAuthenticated, // Only fetch if logged in
  });
}
*/

// --- Hook: useCreatePost ---
/**
 * Provides a mutation function to create a new post.
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth(); // Get current user to invalidate their posts query

  return useMutation({
    mutationFn: async (postData) => {
      // Add image upload logic here later if needed
      console.log("Creating post:", postData);
      const response = await apiService.post('/posts', postData);
      return response; // Assuming interceptor returns response.data
    },
    onSuccess: (newPost) => {
      console.log("Post created successfully:", newPost);
      // --- Cache Update Strategy: Invalidate User's Posts Query ---
      // Invalidate the specific user's posts query to trigger a refetch.
      // Also invalidate the general feed query if it were being used.
      queryClient.invalidateQueries({ queryKey: ["posts", "user", currentUser?._id] });
      // queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }); // If using general feed
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
 */
export function useReactToPost() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth(); // Get current user

  return useMutation({
    mutationFn: async ({ postId, emoji }) => {
      console.log(`Reacting to Post ${postId} with ${emoji}`);
      const response = await apiService.post('/reactions', {
        targetType: 'Post',
        targetId: postId,
        emoji: emoji,
      });
      return { postId, updatedReactions: response }; 
    },
    // Instead of invalidating, let's try optimistic updates or manual cache updates for reactions later
    // For now, simple invalidation:
    onSuccess: (data, variables) => {
      console.log(`Reaction successful for Post ${variables.postId}:`, data.updatedReactions);
      // --- Cache Update Strategy: Invalidate Relevant Queries ---
      // Invalidate queries that display this post (user's feed, potentially general feed)
      // Getting the authorId would be ideal here, but for simplicity, 
      // invalidate current user's posts and potentially the general feed.
      // A better approach involves updating the query cache directly.
      queryClient.invalidateQueries({ queryKey: ["posts", "user"] }); // Invalidate all user post queries
      // queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }); // If using general feed
      // queryClient.invalidateQueries({ queryKey: ["posts", "user", postAuthorId] }); // Ideal if authorId known
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
  const { user: currentUser } = useAuth(); // Get current user

  return useMutation({
    mutationFn: async (postId) => {
      console.log(`Deleting post: ${postId}`);
      await apiService.delete(`/posts/${postId}`);
      return postId; 
    },
    onSuccess: (postId) => {
      console.log(`Post ${postId} deleted successfully`);
      // --- Cache Update Strategy: Invalidate Relevant Queries ---
      queryClient.invalidateQueries({ queryKey: ["posts", "user", currentUser?._id] });
      // queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }); // If using general feed
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

*   **`usePostsQuery` Commented Out**: We comment this out as it's not the primary hook used in the current `HomePage` (tabbed) or `ProfilePage` structure, which rely on `useUserPosts` (from `useUserQuery.js`).
*   **Mutations (`useCreatePost`, `useReactToPost`, `useDeletePost`)**: These are kept. Note the `onSuccess` handlers now primarily focus on invalidating the *user-specific* post queries (`queryKey: ["posts", "user", currentUser?._id]`) because that's where the changes will be most immediately visible (in the user's own profile tab or page). Invalidation for reactions is broad (`["posts", "user"]`) for simplicity, but could be refined.

## 3. Create Post Creation Component

Create/Verify `src/features/post/PostForm.jsx`. (The code from the original Step 5 can be kept, as it correctly uses `useAuth` and `useCreatePost`).

```jsx
// src/features/post/PostForm.jsx
// (Keep code as provided in original Step 5)
import React from "react";
import { useForm } from "react-hook-form";
// ... other imports (yup, useAuth, useCreatePost, Avatar, Button, Card, Textarea, Form, icons, Link, toast, getInitials)

const postSchema = yup.object({ /* ... */ }).required();

function PostForm() {
  const { user } = useAuth(); 
  const { mutate: createPostMutate, isPending: isCreatingPost } = useCreatePost();
  const form = useForm({ /* ... resolver, defaultValues ... */ });

  const onSubmit = async (data) => { /* ... call createPostMutate ... */ };

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <Card className="mb-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            {/* ... Avatar + Textarea inside FormField ... */}
          </CardContent>
          <CardFooter className="flex justify-between border-t px-4 py-3">
            {/* ... Add Image Button (Placeholder) ... */}
            {/* ... Submit Button w/ Loading State ... */}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default PostForm;
```

## 4. Create/Update the Post List Component

Ensure `src/features/post/PostList.jsx` exists and is up-to-date. This component is responsible for rendering a list of posts and handling interactions like liking, deleting, and toggling comments (comments handled in the next step). (The code from the original Step 5 can be kept).

```jsx
// src/features/post/PostList.jsx
// (Keep code as provided in original Step 5)
import React, { useState } from "react"; 
import PropTypes from 'prop-types';
// ... other imports (Link, Avatar, date-fns, icons, Card, getInitials, Button, DropdownMenu, useAuth, useReactToPost, useDeletePost, cn, CommentList)

function PostList({ posts = [] }) {
  const { user: currentUser } = useAuth();
  const { mutate: reactToPostMutate, isPending: isReacting } = useReactToPost(); 
  const { mutate: deletePostMutate, isPending: isDeleting } = useDeletePost();
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({}); 

  const handleReaction = (postId, emoji) => { /* ... call reactToPostMutate ... */ };
  const handleDeleteClick = (postId) => { /* ... confirm and call deletePostMutate ... */ };
  const toggleComments = (postId) => { /* ... update expandedComments state ... */ };

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
          const isLikedByCurrentUser = /* ... check reactions ... */;
          const isCurrentlyDeleting = /* ... check deletingPostId ... */;
          const areCommentsExpanded = /* ... check expandedComments ... */;

          return (
            <Card key={post._id} className={/* ... conditional class ... */}> 
              <CardHeader className="p-0">{/* ... Author Info + Delete Dropdown ... */}</CardHeader>
              <CardContent className="px-4 pb-2 pt-0">{/* ... Post Content + Image ... */}</CardContent>
              <CardFooter className="px-4 py-2 bg-muted/50 border-t">
                {/* ... Like Button + Comment Button ... */}
              </CardFooter>
              {/* ... Expanded Comments Section (using CommentList from next step) ... */}
            </Card>
          )
      })}
    </div>
  );
}
PostList.propTypes = { /* ... */ };
export default PostList;
```

## 5. Integration Notes

*   The `PostForm` component is used within the `Profile` component (`src/features/user/Profile.jsx`) as detailed in Step 4.
*   The `PostList` component is used within both the `Profile` component (showing the current user's posts fetched via `useUserPosts`) and the `ProfilePage` component (`src/pages/ProfilePage.jsx`) (showing the viewed user's posts fetched via `useUserPosts`).
*   No general `Feed` component is implemented in this step, as the main views now focus on user-specific content within tabs or profile pages.

## 6. Running the Application

Run `npm run dev` and test post functionality:

1.  **Navigate to HomePage:** Log in. The "Profile" tab should show the `PostForm` and your existing posts (via `Profile` -> `PostList`).
2.  **Create Post:** Type content into the `PostForm` and click "Post". The post list below should update to include your new post (after cache invalidation).
3.  **Like Post:** Click the heart icon on a post. It should visually update (if styles are set up), and the count might change after refetch.
4.  **Delete Post:** Click the ellipsis (...) on one of your own posts and select "Delete". Confirm the deletion. The post should disappear from the list.
5.  **Navigate to ProfilePage:** View your own profile via `/user/yourUserId` or another user's profile (`/user/user2`). The posts displayed should be specific to that user, fetched via `useUserPosts`.

## 7. Frequently Asked Questions (FAQ)

*   **Q: Why invalidate queries in `onSuccess` instead of updating the cache directly?**
    *   A: Invalidation is simpler to implement initially. It tells React Query "this data is stale, refetch it". Direct cache updates (`queryClient.setQueryData`) can provide a faster UI response (optimistic updates) but require more careful logic to handle potential rollbacks if the mutation fails server-side. We prioritize simplicity here.
*   **Q: Why don't we need a general `usePostsQuery` or `Feed` component now?**
    *   A: With the tabbed layout on `HomePage` focusing on the current user (Profile, Friends, etc.) and `ProfilePage` showing specific users, there isn't a dedicated page displaying a combined feed of *all* posts. We fetch posts per-user using `useUserPosts`. If a global feed page were needed later, `usePostsQuery` and a `Feed` component could be reintroduced.
*   **Q: Will fetching *all* posts/comments be slow?**
    *   A: With the limited sample data in the mock API, performance impact is negligible. In a real application with potentially thousands of items, fetching everything at once would be inefficient and a different data fetching strategy (like cursor-based loading or virtualization) would be necessary for production.

## What's Next?

Users can now create, view, and interact with posts within their profile context. The next logical step is adding comments.

In **Step 6: Comments System**, we'll build the components and hooks necessary to allow users to comment on posts.