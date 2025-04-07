# Step 6: Comments System

In this step, we'll implement the comments system, allowing users to view, add, react to, and delete comments on posts. This involves:

1.  **Building Comment Components:** Creating/updating `CommentItem`, `CommentForm`, and `CommentList` to handle display and interactions using `apiService`.
2.  **Integrating Comments into Posts:** Updating `PostCard` to fetch and display comments when requested, and handle comment count updates.
3.  **Managing State & Updates:** Using `useState` for local loading/error states and callbacks (`on...`) to trigger data refetches in parent components.

## 1. Add Required UI Components

Ensure you have the necessary ShadCN components. Add `dialog` if you haven't already (used in `PostCard` for delete, might be reused for comments).

```bash
npx shadcn-ui@latest add card avatar button input dropdown-menu alert dialog
```

## 2. Create/Update Comment Components

These components display and handle comment interactions.

Update `src/features/comment/CommentItem.jsx`:

```jsx
// src/features/comment/CommentItem.jsx
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { useAppStore } from "@/lib/store";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

// Hooks & Utilities
import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

// ShadCN Components
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
} from "@/components/ui/alert-dialog"; // Keep AlertDialog for consistency
import { Heart, MoreVertical, Trash2, Loader2 } from "lucide-react";

/**
 * Displays a single comment with interactions.
 */
function CommentItem({ comment, postId, onDeleteSuccess, onReactionSuccess }) {
  const currentUser = useAppStore(state => state.currentUser);
  const [isReacting, setIsReacting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!comment || !comment.author) return null; // Basic validation

  const isLikedByCurrentUser = comment.reactions?.some(
    r => r.author?._id === currentUser?._id && r.emoji === 'like'
  );
  const likeCount = comment.reactions?.filter(r => r.emoji === 'like').length || 0;
  const isCommentAuthor = currentUser?._id === comment.author._id;

  // --- Reaction Handler ---
  const handleReaction = async () => {
    if (isReacting || !currentUser) return;
    setIsReacting(true);
    try {
      await apiService.post('/reactions', {
        targetType: 'Comment',
        targetId: comment._id,
        emoji: 'like' // Hardcoding 'like'
      });
      // Notify parent (CommentList -> PostCard -> ...) to refetch comments
      if (onReactionSuccess) onReactionSuccess(comment._id, postId);
    } catch (error) {
      console.error("Failed to react to comment:", error);
      toast.error(error.message || "Failed to update reaction");
    } finally {
      setIsReacting(false);
    }
  };

  // --- Delete Handlers ---
  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    if (isDeleting || !isCommentAuthor) return;
    setIsDeleting(true);
    try {
      await apiService.delete(`/comments/${comment._id}`);
      toast.success("Comment deleted");
      // Notify parent (CommentList -> PostCard -> ...) to refetch comments & potentially post count
      if (onDeleteSuccess) onDeleteSuccess(comment._id, postId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(error.message || "Failed to delete comment");
      setIsDeleting(false); // Reset on error
    }
     // Don't reset isDeleting in finally, component might unmount
  };

  const openDeleteConfirm = () => setShowDeleteConfirm(true);

  return (
    <div className={cn("flex gap-3 py-2", isDeleting && "opacity-50 pointer-events-none")}>
      <Link to={`/user/${comment.author._id}`} className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={comment.author.avatarUrl || ''} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 group">
        {/* Comment Bubble */} 
        <div className="bg-muted px-3 py-2 rounded-lg relative">
          {/* Delete Button (Top Right on Hover) */} 
          {isCommentAuthor && (
            <div className="absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <MoreVertical className="h-3 w-3" />}
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openDeleteConfirm} className="text-destructive focus:text-destructive text-xs flex items-center gap-2 cursor-pointer" disabled={isDeleting}>
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                  {/* Add Edit comment later if needed */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {/* Author Name */} 
          <Link to={`/user/${comment.author._id}`} className="text-xs font-semibold hover:underline">
            {comment.author.name}
          </Link>
          {/* Comment Content */} 
          <p className="text-sm whitespace-pre-wrap mt-1 break-words">{comment.content}</p>
        </div>
        {/* Actions Below Bubble */} 
        <div className="flex items-center gap-2 mt-1 px-1 text-xs text-muted-foreground">
          {/* Like Button */} 
          <Button variant="ghost" size="xs" onClick={handleReaction} disabled={isReacting || isDeleting} className={cn("flex items-center gap-0.5 h-auto p-0 hover:text-primary", isLikedByCurrentUser ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground')}>
            <Heart className={cn("h-3 w-3", isLikedByCurrentUser && 'fill-current text-red-500')} />
            <span className="ml-0.5">{likeCount}</span>
            <span className="sr-only">Likes</span>
          </Button>
          <span>•</span>
          {/* Timestamp */} 
          <span title={new Date(comment.createdAt).toLocaleString()}>{formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}</span>
          {comment.updatedAt && comment.createdAt !== comment.updatedAt && (<><span>•</span><span>Edited</span></>)}
        </div>
      </div>

      {/* Delete Confirmation */} 
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        {/* ... AlertDialog structure same as in PostCard ... */}
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to permanently delete this comment?
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
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.shape({ // Make author optional for robustness
      _id: PropTypes.string,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    reactions: PropTypes.array,
  }).isRequired,
  postId: PropTypes.string.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  onReactionSuccess: PropTypes.func.isRequired,
};

export default CommentItem;
```

Update `src/features/comment/CommentForm.jsx`:

```jsx
// src/features/comment/CommentForm.jsx
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppStore } from "@/lib/store";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

// ShadCN & Icons
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Send, Loader2 } from "lucide-react";
import { getInitials } from "@/utils/formatters";

// Validation
const commentSchema = yup.object({ 
    content: yup.string().trim().required("Comment cannot be empty").max(280, "Comment too long") 
}).required();

/**
 * Form for adding a new comment to a post.
 */
function CommentForm({ postId, onCommentCreated }) {
  const currentUser = useAppStore(state => state.currentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // We don't really need error state here, toast is enough

  const form = useForm({ 
      resolver: yupResolver(commentSchema), 
      defaultValues: { content: "" } 
  });

  const onSubmit = async (data) => {
    if (!currentUser || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Post the comment using apiService
      // The mock server adds the author automatically based on the logged-in user (user1)
      const newComment = await apiService.post(`/posts/${postId}/comments`, { 
          content: data.content 
      });
      
      toast.success("Comment posted");
      form.reset(); // Clear the form
      if (onCommentCreated) {
        onCommentCreated(newComment); // Notify parent
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error(error.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null; // Don't render form if not logged in

  return (
    <Form {...form}>
      {/* Use novalidate to rely purely on RHF/Yup validation */} 
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex items-start gap-2 py-2">
        <Avatar className="h-8 w-8 border mt-1 flex-shrink-0">
          <AvatarImage src={currentUser.avatarUrl || ''} alt={currentUser.name} />
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1 relative">
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Write a comment..." 
                    className="pr-10 h-9 text-sm rounded-full bg-background" // Rounded input
                    {...field} 
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  {/* Submit button inside the input */}
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost" 
                    disabled={isSubmitting || !form.formState.isValid || !field.value}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Post comment</span>
                  </Button>
                </div>
              </FormControl>
              {/* Display validation message below */}
              <FormMessage className="text-xs absolute -bottom-4 left-1" /> 
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

CommentForm.propTypes = { 
    postId: PropTypes.string.isRequired, 
    onCommentCreated: PropTypes.func.isRequired 
};
export default CommentForm;
```

Update `src/features/comment/CommentList.jsx` to fetch comments:

```jsx
// src/features/comment/CommentList.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import apiService from "@/lib/apiService";

// Components
import { Loader2, AlertCircle } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

/**
 * Fetches and displays comments for a given post.
 * Handles comment creation, deletion, and reaction updates via callbacks.
 */
function CommentList({ postId, onCommentDataChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments function (memoized)
  const fetchComments = useCallback(async () => {
    // Don't set loading=true on refetch if comments already exist
    if (comments.length === 0) setLoading(true); 
    setError(null);
    console.log(`CommentList: Fetching comments for post: ${postId}`);
    try {
      const response = await apiService.get(`/posts/${postId}/comments`);
      // API returns { comments: [...] }
      setComments(response.comments || []); 
    } catch (err) {
      console.error(`CommentList: Failed to fetch comments for post ${postId}:`, err);
      setError(err.message || "Could not load comments.");
      setComments([]); // Clear comments on error
    } finally {
      setLoading(false);
    }
  }, [postId, comments.length]); // Re-run if postId changes or initial load

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // Run once on mount (and if fetchComments changes)

  // Handler for updates (create, delete, react)
  const handleCommentUpdate = () => {
     console.log(`CommentList: Comment data changed for post ${postId}, refetching...`);
     fetchComments(); // Refetch comments
     // Also notify the PostCard/parent component that comment data (e.g., count) might have changed
     if (onCommentDataChange) {
         onCommentDataChange(postId); 
     }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      {/* Comment Input Form */}
      <CommentForm postId={postId} onCommentCreated={handleCommentUpdate} />

      {/* Loading State */} 
      {loading && comments.length === 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */} 
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Comments</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Comments List or Empty State */} 
      {!loading && !error && (
        <> 
          {comments.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">No comments yet. Be the first!</div>
          ) : (
            <div className="mt-4 space-y-2">
              {comments.map(comment => (
                <CommentItem 
                  key={comment._id} 
                  comment={comment} 
                  postId={postId} 
                  onDeleteSuccess={handleCommentUpdate} // Trigger refetch on delete
                  onReactionSuccess={handleCommentUpdate} // Trigger refetch on reaction
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

CommentList.propTypes = { 
    postId: PropTypes.string.isRequired, 
    onCommentDataChange: PropTypes.func.isRequired, // Callback to notify PostCard
};
export default CommentList;
```

**Explanation:**

*   **`CommentItem.jsx`**: Handles delete/like via `apiService` calls within `handleDelete`/`handleReaction`. Uses local `useState` for loading states. Calls `onDeleteSuccess` or `onReactionSuccess` props on success.
*   **`CommentForm.jsx`**: Uses RHF/Yup. `onSubmit` calls `apiService.post(...)` and then the `onCommentCreated` prop.
*   **`CommentList.jsx`**: Fetches comments via `useEffect`/`apiService`. Manages `comments`, `loading`, `error` state locally. Passes `handleCommentUpdate` down to `CommentForm` and `CommentItem` (as `onDeleteSuccess`, `onReactionSuccess`). `handleCommentUpdate` refetches comments *and* calls `onCommentDataChange` (passed from `PostCard`) to signal that post data (like comment count) might need updating.

## 3. Update `PostCard` to Integrate Comments

Modify `src/features/post/PostCard.jsx` to fetch/show comments.

```jsx
// src/features/post/PostCard.jsx
// ... (imports remain largely the same, add useState, useCallback, CommentList)
import React, { useState, useCallback } from "react"; // Add useState, useCallback
// ... other imports
import CommentList from "@/features/comment/CommentList"; // Import CommentList
import { MessageSquare } from 'lucide-react'; // Ensure MessageSquare is imported

// ... (propTypes remain similar, add onCommentDataChange)
PostCard.propTypes = {
  // ... existing post prop shape
  onDeleteSuccess: PropTypes.func.isRequired,
  onReactionSuccess: PropTypes.func.isRequired,
  onCommentDataChange: PropTypes.func.isRequired, // Add this callback
};

function PostCard({ post, onDeleteSuccess, onReactionSuccess, onCommentDataChange }) {
  // ... (existing state: isLiking, isDeleting, showDeleteConfirm)
  const currentUser = useAppStore(state => state.currentUser);
  const [showComments, setShowComments] = useState(false);
  // Store comment count locally to update immediately after comment creation/deletion
  const [localCommentCount, setLocalCommentCount] = useState(post?.commentCount || 0);

  // Update local count if prop changes (e.g., after parent refetch)
  useEffect(() => {
      setLocalCommentCount(post?.commentCount || 0);
  }, [post?.commentCount]);
  
  // ... (isCurrentUserPost, isLiked, likeCount calculated as before)
  
  // --- Like/Unlike Handler (Update to call onReactionSuccess) ---
  const handleLike = async () => {
    // ... (try/catch block remains same)
    try {
        await apiService.post('/reactions', { /* ... */ });
        // Notify parent (PostList -> HomePage) that post data changed
        if (onReactionSuccess) onReactionSuccess(post._id); 
    } catch (error) { /* ... */ }
    // ... (finally block)
  };

  // --- Delete Handler (Update to call onDeleteSuccess) ---
  const handleDelete = async () => {
     // ... (try/catch block remains same)
    try {
      await apiService.delete(`/posts/${post._id}`);
      toast.success("Post deleted");
      // Notify parent (PostList -> HomePage)
      if (onDeleteSuccess) onDeleteSuccess(post._id); 
    } catch (error) { /* ... */ }
    // ... (no finally needed)
  };
  
   // --- Comment Update Handler (Called by CommentList) ---
  const handleCommentUpdate = useCallback((postId) => {
      // This function is primarily called by CommentList to signal that
      // the PostCard (and potentially its parent list) needs to know
      // that comment data changed, potentially affecting the comment count.
      // We *could* refetch the post here, but it's often better to let the parent handle it.
      console.log(`PostCard: Comment data changed for post ${postId}, notifying parent.`);
      // Update local count optimistically? Or just rely on parent refetch?
      // For simplicity, just notify the parent which should trigger a refetch of the post list.
      if (onCommentDataChange) {
          onCommentDataChange(postId); 
      }
      // We could also update the localCommentCount based on the event if needed,
      // but relying on parent refetch is simpler for now.
      // Example: setLocalCommentCount(prev => prev + 1); // On create
      // Example: setLocalCommentCount(prev => prev - 1); // On delete
  }, [onCommentDataChange]);

  const toggleComments = () => setShowComments(prev => !prev);
  
  // ... (openDeleteConfirm)

  // --- Render Logic ---
  if (!post || !post.author) return null;

  return (
    <Card className={cn("w-full shadow-sm", isDeleting && "opacity-50 pointer-events-none")}>
      {/* CardHeader ... (no changes needed) */}
      {/* CardContent ... (no changes needed) */}
      
      {/* CardFooter: Update Comment Button */}
      <CardFooter className="p-2 border-t flex justify-between items-center">
        <div className="flex gap-1">
          {/* Like Button ... (no changes needed) */} 
          <Button variant="ghost" size="sm" onClick={handleLike} /* ... */ >
             <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-500")} />
             <span>{likeCount}</span>
          </Button>
          {/* Comment Button */} 
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleComments} 
            className="flex items-center gap-1 text-muted-foreground hover:text-primary px-2"
            aria-expanded={showComments}
            disabled={isDeleting}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{localCommentCount}</span> {/* Use localCommentCount */} 
            <span className="sr-only">Comments</span>
          </Button>
        </div>
        {/* ... other footer elements */} 
      </CardFooter>

      {/* Conditionally Render CommentList */} 
      {showComments && (
        <div className="p-3 pt-2 border-t border-border/50 bg-muted/30">
          <CommentList 
              postId={post._id} 
              onCommentDataChange={handleCommentUpdate} // Pass callback
          /> 
        </div>
      )}

      {/* Delete Confirmation Dialog ... (no changes needed) */} 
    </Card>
  );
}

export default PostCard;
```

**Explanation:**

*   Added `showComments` state to toggle comment visibility.
*   Added `localCommentCount` state, initialized from `post.commentCount`, to potentially allow optimistic updates (though currently relying on parent refetch).
*   The comment button in the footer now uses `toggleComments` for its `onClick`.
*   `CommentList` is conditionally rendered based on `showComments`.
*   A new prop `onCommentDataChange` is added to `PostCard` and passed down to `CommentList`.
*   `handleCommentUpdate` is called by `CommentList` when comment data changes. It then calls the `onCommentDataChange` prop to notify `PostList` -> `HomePage` that post data (specifically the comment count) might need updating, likely triggering a refetch of the main post list.
*   The existing `onDeleteSuccess` and `onReactionSuccess` props are kept to notify the parent list immediately about those specific changes.

## 4. Update `HomePage` (and potentially `ProfilePage`)

The parent component rendering `PostList` (e.g., `HomePage`) needs to provide the `onCommentDataChange` callback.

Update `src/pages/HomePage.jsx`:

```jsx
// src/pages/HomePage.jsx
// ... (imports)

function HomePage() {
  // ... (existing state: posts, loading, error)
  // ... (fetchPosts function)
  // ... (useEffect for initial fetch)

  // Handler for changes (post create/delete, reaction, comment create/delete)
  const handleDataChange = useCallback(() => {
    console.log("HomePage: Data changed, refetching posts...");
    fetchPosts(); // Refetch the entire posts list
  }, [fetchPosts]); // Depend on fetchPosts instance

  // ... (render logic: loading, error)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PostForm onPostCreated={handleDataChange} />

      {error && ( /* ... Error Alert ... */ )}
      
      {!loading && !error && (
          <PostList 
            posts={posts} 
            onDeleteSuccess={handleDataChange} 
            onReactionSuccess={handleDataChange} 
            onCommentDataChange={handleDataChange} // Pass the same handler
          />
      )}
    </div>
  );
}

export default HomePage;
```

*(Note: If using `PostList` in `ProfilePage` as well, ensure the `onCommentDataChange` prop is passed down there too, triggering its respective post refetch logic.)*

**Explanation:**

*   The same `handleDataChange` function (which calls `fetchPosts`) is now passed as `onCommentDataChange` to `PostList`. This ensures that any action within the comment system that requires updating the post data (like the comment count) triggers a refresh of the main post feed in `HomePage`.

## 5. Running the Application

Test the integrated comments system:

```bash
npm run dev
```

1.  Log in and go to the `HomePage`.
2.  Click the comment count button on a post to expand/collapse the comments section.
3.  Add a new comment using the form within the expanded section. Verify the comment appears and the comment count on the post card updates.
4.  Like a comment. Verify the like count updates.
5.  Delete your own comment using the dropdown menu on the comment. Verify it disappears and the comment count on the post card updates.

## 6. Frequently Asked Questions (FAQ)

*   **Q: How do comment updates trigger post list refetches?**
    *   A: `CommentItem` calls callbacks (`onDeleteSuccess`, `onReactionSuccess`) passed from `CommentList`. `CommentForm` calls `onCommentCreated`. `CommentList` handles these by calling its own `handleCommentUpdate` function. This function both refetches the comments for that specific post *and* calls the `onCommentDataChange` prop passed down from `PostCard`. `PostCard` receives this and calls *its* `onCommentDataChange` prop (passed from `PostList` in `HomePage`). Finally, `HomePage` receives this call via `handleDataChange` and triggers `fetchPosts()` to refresh the entire main feed, ensuring comment counts on post cards are updated.
*   **Q: This callback drilling seems complex?**
    *   A: Yes, passing callbacks down multiple levels can become cumbersome. This is where state management libraries (like Zustand, even for server state) or dedicated data-fetching libraries (like React Query, SWR) often simplify things by providing global access to mutation functions and automatic cache invalidation/updates, reducing the need for prop drilling.

## What's Next?

We have a functional commenting system! Users can now engage more deeply with posts. The next major feature is the friend system.

// src/features/post/PostList.jsx
import React, { useState } from "react"; 
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getInitials } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import { useReactToPost, useDeletePost } from "@/hooks/usePostQuery"; 
import { cn } from "@/lib/utils";
import CommentList from "@/features/comment/CommentList"; // Import CommentList

function PostList({ posts = [] }) {
  const { user: currentUser } = useAuth();
  const { mutate: reactToPostMutate, isPending: isReacting } = useReactToPost(); 
  const { mutate: deletePostMutate, isPending: isDeleting } = useDeletePost();
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({}); 

  const handleReaction = (postId, emoji) => {
    reactToPostMutate({ postId, emoji });
  };

  const handleDeleteClick = (postId) => {
    if (isDeleting) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      setDeletingPostId(postId);
      deletePostMutate(postId, { 
          onSettled: () => setDeletingPostId(null) 
      });
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

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
          const isLikedByCurrentUser = post.reactions?.some(
              (reaction) => reaction.author._id === currentUser?._id && reaction.emoji === 'like'
          );
          const isCurrentlyDeleting = isDeleting && deletingPostId === post._id;
          const areCommentsExpanded = !!expandedComments[post._id]; 

          return (
            <Card key={post._id} className={cn("overflow-hidden shadow-sm", isCurrentlyDeleting && "opacity-50 pointer-events-none")}> 
              <CardHeader className="p-0">
                <div className="flex items-center justify-between p-4">
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
                {post.content && (
                  <p className="text-sm whitespace-pre-wrap mb-3">
                    {post.content}
                  </p>
                )}
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
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleReaction(post._id, 'like')}
                        disabled={isReacting}
                        className={cn(
                            "flex items-center gap-1 hover:text-primary px-2",
                            isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                      <Heart className={cn("h-4 w-4", isLikedByCurrentUser && 'fill-primary')} />
                      <span>{post.reactions?.filter(r => r.emoji === 'like').length || 0}</span> 
                      <span className="sr-only">Likes</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary px-2"
                        aria-expanded={areCommentsExpanded}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.commentCount || 0}</span>
                      <span className="sr-only">Comments</span>
                    </Button>
                  </div>
                </div>
              </CardFooter>

              {areCommentsExpanded && (
                <div className="p-4 pt-2 border-t border-border/50">
                  <CommentList postId={post._id} />
                </div>
              )}
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
    reactions: PropTypes.array,
    commentCount: PropTypes.number,
  })),
};

export default PostList;
```

**Explanation:**

*   State (`expandedComments`) is added to `PostList` to track visibility per post.
*   The comment button's `onClick` now calls `toggleComments`.
*   `CommentList` is conditionally rendered below the footer based on the `areCommentsExpanded` state.

## 5. Running the Application

Test the integrated comments system:

```bash
npm run dev
```

1.  Click the comment count button on a post to expand/collapse the comments.
2.  Add, like, and delete comments.
3.  Verify comment counts on the post card update correctly after adding/deleting comments.

## 6. Frequently Asked Questions (FAQ)

*   **Q: Why invalidate `["posts", "user"]` when adding/deleting a comment?**
    *   A: Because the comment count is displayed *on the post card itself*. To ensure this count is accurate after adding or deleting a comment, we refetch the post data.
*   **Q: Why *not* invalidate `["posts", "user"]` when liking a comment?**
    *   A: Liking a comment usually only affects the comment itself, not the overall post data displayed in the feed. Invalidating just the specific comment query (`["comments", postId]`) is sufficient.
*   **Q: How is `postId` passed to `useDeleteComment`'s `onSuccess`?**
    *   A: React Query's `mutate` function accepts a second options object. We pass `{ postId }` as variables when calling `deleteCommentMutate(comment._id, { postId })`. These variables are then passed as the second argument to the `onSuccess` callback.

## What's Next?

We've implemented commenting! The next step focuses on building out the friend system.

In **Step 7: Friend System**, we will implement viewing friends, managing friend requests, and finding users. 