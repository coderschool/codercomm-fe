# Step 6: Comments System

In this step, we'll implement the comments system, allowing users to view, add, react to, and delete comments on posts. This involves:

1.  **Creating Comment Hooks:** Using React Query to fetch, create, react to, and delete comments.
2.  **Building Comment Components:** Creating components to display individual comments (`CommentItem`), the comment input form (`CommentForm`), and the list of comments for a post (`CommentList`).
3.  **Integrating Comments into Posts:** Updating the `PostList` component to show/hide and render the `CommentList`.

## 1. Understanding the Mock API Endpoints for Comments

Let's clarify the relevant mock API endpoints:

*   `GET /api/posts/:postId/comments`: Fetches comments for a specific post (paginated, though we'll fetch all for simplicity initially).
*   `POST /api/comments`: Creates a new comment (requires `content` and `postId`).
*   `DELETE /api/comments/:commentId`: Deletes a specific comment (user must be the author).
*   `POST /api/reactions`: Creates/updates/removes a reaction on a comment (requires `{ targetType: 'Comment', targetId: commentId, emoji }`).

## 2. Create Comment Hooks with React Query

We need hooks specifically for comment data.

Create `src/hooks/useCommentQuery.js`:

```jsx
// src/hooks/useCommentQuery.js
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

// --- Hook: useCommentsQuery ---
/**
 * Fetches comments for a specific post.
 * @param {string | undefined} postId - ID of the post. Query disabled if falsy.
 */
export function useCommentsQuery(postId) {
  return useQuery({
    // Query key includes postId to cache comments per post.
    queryKey: ["comments", postId], 
    queryFn: async () => {
      console.log(`Fetching comments for post: ${postId}`);
      // Fetch all comments for now (no pagination in this hook implementation)
      const response = await apiService.get(`/posts/${postId}/comments?limit=100`); 
      // Mock API returns { comments: [], count: X, totalPages: Y }
      return response.data.comments; // Return only the comments array
    },
    enabled: !!postId, // Only run if postId is provided
  });
}

// --- Hook: useCreateComment ---
/**
 * Provides a mutation function to create a new comment.
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData) => {
      // commentData should contain { postId: string, content: string }
      console.log("Creating comment:", commentData);
      const response = await apiService.post("/comments", commentData);
      return response.data; // Return the newly created comment
    },
    onSuccess: (newComment) => {
      console.log("Comment created:", newComment);
      // --- Cache Update Strategy: Invalidate Related Queries ---
      // 1. Invalidate the comments query for this specific post to refetch.
      queryClient.invalidateQueries({ queryKey: ["comments", newComment.post] });
      // 2. Invalidate the main feed query to update the comment count on the post card.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      // 3. Optional: Invalidate user-specific post list if viewing that.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
      toast.success("Comment posted successfully");
    },
    onError: (error) => {
      console.error("Failed to create comment:", error);
      toast.error(error.message || "Failed to post comment");
    },
  });
}

// --- Hook: useDeleteComment ---
/**
 * Provides a mutation function to delete a comment.
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      console.log(`Deleting comment: ${commentId}`);
      // DELETE request to the specific comment endpoint
      await apiService.delete(`/comments/${commentId}`);
      // Return commentId for potential optimistic updates (not used here)
      return commentId; 
    },
    // We need postId in onSuccess to invalidate the correct query
    // We can pass it through using the second argument of mutate
    onSuccess: (commentId, variables) => { 
      const { postId } = variables; // Get postId passed during mutation call
      console.log(`Comment ${commentId} deleted successfully`);
      
      // --- Cache Update Strategy: Invalidate Related Queries ---
      // 1. Invalidate comments for the specific post.
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
      // 2. Invalidate the main feed to update comment count.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      // 3. Optional: Invalidate user-specific post lists.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
      toast.error(error.message || "Failed to delete comment");
    },
  });
}

// --- Hook: useReactToComment ---
/**
 * Provides a mutation function to react (like/unlike) a comment.
 */
export function useReactToComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, emoji }) => {
      console.log(`Reacting to Comment ${commentId} with ${emoji}`);
      const response = await apiService.post('/reactions', {
        targetType: 'Comment',
        targetId: commentId,
        emoji: emoji,
      });
      // Return commentId and updated reactions for cache update
      return { commentId, updatedReactions: response.data };
    },
    onSuccess: ({ commentId, updatedReactions }, variables) => {
      const { postId } = variables; // Get postId passed during mutation call
      console.log(`Reaction successful for Comment ${commentId}:`, updatedReactions);
      
      // --- Cache Update Strategy: Invalidate Comments Query ---
      // Invalidate the comments for this post to show updated reaction count/state.
      if (postId) {
         queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
      // Note: We don't necessarily need to invalidate the main post feed here,
      // as the comment reaction count isn't typically shown on the post card itself.
      
      // toast.success("Comment reaction updated");
    },
    onError: (error) => {
      console.error("Failed to react to comment:", error);
      toast.error(error.message || "Failed to update comment reaction");
    },
  });
}
```

**Explanation:**

*   **`useCommentsQuery`**: Fetches the list of comments for a given `postId`.
*   **`useCreateComment`**: Handles creating a comment. On success, it invalidates both the comments query for the post *and* the main feed query (to update the comment count on the post card).
*   **`useDeleteComment`**: Handles deleting a comment. On success, it also invalidates both comments and feed queries.
*   **`useReactToComment`**: Handles liking/unliking comments using the `/reactions` endpoint. On success, it only needs to invalidate the comments query for the specific post, as comment likes usually don't affect the main post display.
*   **Invalidation Strategy**: We consistently use `invalidateQueries` for simplicity. This ensures data consistency by refetching relevant data after mutations.

## 3. Create Comment Components

We need components to display a single comment, the list of comments, and the form to add a comment.

Create `src/features/comment/CommentItem.jsx`:

```jsx
// src/features/comment/CommentItem.jsx
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Hooks & Utilities
import useAuth from "@/hooks/useAuth";
import { useReactToComment, useDeleteComment } from "@/hooks/useCommentQuery";
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
import { Heart, MoreVertical, Trash2, Loader2 } from "lucide-react";

/**
 * Displays a single comment item with author, content, timestamp, and actions.
 */
function CommentItem({ comment, postId }) {
  const { user: currentUser } = useAuth();
  // Get mutation hooks and their states
  const { mutate: reactToCommentMutate, isPending: isReacting } = useReactToComment();
  const { mutate: deleteCommentMutate, isPending: isDeleting } = useDeleteComment();

  // Handler for liking/unliking a comment
  const handleReaction = () => {
    if (isReacting) return; // Prevent multiple clicks
    reactToCommentMutate({ 
        commentId: comment._id, 
        emoji: 'like',
        postId: postId // Pass postId for invalidation
    });
  };

  // Handler for deleting a comment
  const handleDeleteClick = () => {
    if (isDeleting) return; // Prevent multiple clicks
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutate(comment._id, { 
          // Pass postId in the second argument (variables) for onSuccess callback
          postId: postId 
      });
    }
  };
  
  // Check if the current user has liked this comment
  const isLikedByCurrentUser = comment.reactions?.some(
      r => r.author._id === currentUser?._id && r.emoji === 'like'
  );
  // Check if this comment belongs to the current user
  const isCommentAuthor = currentUser?._id === comment.author._id;

  return (
    <div className="flex gap-3 py-2">
      {/* Author Avatar */}
      <Link to={`/user/${comment.author._id}`} className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={comment.author.avatarUrl || ''} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      
      {/* Comment Body and Actions */}
      <div className="flex-1 group">
        <div className="bg-muted px-3 py-2 rounded-lg relative">
          {/* Delete Menu (only for author) */}
          {isCommentAuthor && (
            <div className="absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                         <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <MoreVertical className="h-3 w-3" />
                    )}
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Add Edit later */} 
                  <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive text-xs flex items-center gap-2 cursor-pointer"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Author Name */}
          <Link 
            to={`/user/${comment.author._id}`}
            className="text-xs font-semibold hover:underline"
          >
            {comment.author.name}
          </Link>
          
          {/* Comment Content */}
          <p className="text-sm whitespace-pre-wrap mt-1">{comment.content}</p>
        </div>
        
        {/* Actions (Like, Timestamp) */}
        <div className="flex items-center gap-2 mt-1 px-1 text-xs text-muted-foreground">
          <Button 
            variant="ghost" 
            size="xs" // Custom size potentially needed or use padding
            onClick={handleReaction}
            disabled={isReacting}
            className={cn(
                "flex items-center gap-0.5 h-auto p-0 hover:text-primary", 
                isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Heart className={cn("h-3 w-3", isLikedByCurrentUser && 'fill-primary')} />
            <span className="ml-0.5">{comment.reactions?.filter(r => r.emoji === 'like').length || 0}</span>
            <span className="sr-only">Likes</span>
          </Button>
          
          <span>•</span>
          
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          
          {/* Indicate if edited */}
          {comment.updatedAt && comment.createdAt !== comment.updatedAt && (
            <> 
              <span>•</span> 
              <span>Edited</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.object.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    reactions: PropTypes.array,
  }).isRequired,
  postId: PropTypes.string.isRequired, // Need postId for invalidation/mutation
};

export default CommentItem;
```

Create `src/features/comment/CommentForm.jsx`:

```jsx
// src/features/comment/CommentForm.jsx
import React from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Components
import useAuth from "@/hooks/useAuth";
import { useCreateComment } from "@/hooks/useCommentQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Send, Loader2 } from "lucide-react";

// Utilities
import { getInitials } from "@/utils/formatters";

/**
 * Yup validation schema for the comment form.
 */
const commentSchema = yup.object({
  content: yup.string().required("Comment cannot be empty").trim(),
}).required();

/**
 * Form component for creating a new comment on a post.
 */
function CommentForm({ postId }) {
  const { user } = useAuth();
  const { mutate: createCommentMutate, isPending: isCreatingComment } = useCreateComment();
  
  const form = useForm({
    resolver: yupResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = (data) => {
    console.log("Submitting comment:", data);
    createCommentMutate(
      { postId, content: data.content },
      { onSuccess: () => form.reset() } // Reset form on success
    );
  };

  if (!user) return null; // Don't show form if not logged in

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-3 py-2">
        {/* Current User Avatar */}
        <Avatar className="h-8 w-8 border mt-1 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        
        {/* Comment Input Field */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1 relative">
              {/* <FormLabel className="sr-only">Comment</FormLabel> */}
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Write a comment..."
                    className="pr-10 h-9 text-sm"
                    {...field}
                    disabled={isCreatingComment}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost"
                    disabled={isCreatingComment || !form.formState.isValid}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    {isCreatingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Post comment</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs absolute -bottom-4 left-0" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

CommentForm.propTypes = {
  postId: PropTypes.string.isRequired,
};

export default CommentForm;
```

Create `src/features/comment/CommentList.jsx`:

```jsx
// src/features/comment/CommentList.jsx
import React from "react";
import PropTypes from 'prop-types';
import { useCommentsQuery } from "@/hooks/useCommentQuery";
import { Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Displays a list of comments for a post and includes the comment input form.
 */
function CommentList({ postId }) {
  const { 
    data: comments, // Renamed data to comments
    isLoading,
    isError,
    error 
  } = useCommentsQuery(postId); // Fetch comments for this post

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      {/* Form to add a new comment */}
      <CommentForm postId={postId} />
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs">
                {error?.message || "Could not load comments."}
            </AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      {!isLoading && !isError && (
        <> 
          {comments?.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No comments yet. Be the first!
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {comments?.map(comment => (
                <CommentItem key={comment._id} comment={comment} postId={postId} />
              ))}
              {/* Add pagination / "Load More" button here later if needed */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

CommentList.propTypes = {
  postId: PropTypes.string.isRequired,
};

export default CommentList;
```

**Explanation:**

*   **`CommentItem`**: Displays a single comment, including author info, content, relative timestamp, and actions (like, delete). Uses `useReactToComment` and `useDeleteComment` hooks. Only shows the delete option if the comment author matches the `currentUser`.
*   **`CommentForm`**: Provides an input field and submit button to add a new comment. Uses `react-hook-form`, Yup, and the `useCreateComment` hook.
*   **`CommentList`**: Fetches comments for a given `postId` using `useCommentsQuery`. Handles loading and error states. Renders the `CommentForm` and then maps over the fetched `comments` to render `CommentItem` for each.

## 4. Update the Post List Component

Modify `src/features/post/PostList.jsx` to include the `CommentList` and add a button to toggle its visibility.

```jsx
// src/features/post/PostList.jsx
import React, { useState } from "react"; // Add useState
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

/**
 * Displays a list of posts with interaction buttons and comment section toggle.
 */
function PostList({ posts = [] }) {
  const { user: currentUser } = useAuth();
  const { mutate: reactToPostMutate, isPending: isReacting } = useReactToPost(); 
  const { mutate: deletePostMutate, isPending: isDeleting } = useDeletePost();
  const [deletingPostId, setDeletingPostId] = useState(null);
  // State to track expanded comments for each post
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

  // Function to toggle comment visibility for a specific post
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
          // Check if comments are expanded for this post
          const areCommentsExpanded = !!expandedComments[post._id]; 

          return (
            <Card key={post._id} className={cn("overflow-hidden shadow-sm", isCurrentlyDeleting && "opacity-50 pointer-events-none")}> 
              {/* ... CardHeader remains the same ... */}
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

              {/* ... CardContent remains the same ... */} 
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
              
              {/* CardFooter with updated Comment button action */}
              <CardFooter className="px-4 py-2 bg-muted/50 border-t">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {/* Like Button */}
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
                    {/* Comment Button - Now toggles comment visibility */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleComments(post._id)} // Add toggle handler
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary px-2"
                        aria-expanded={areCommentsExpanded} // Accessibility
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.commentCount || 0}</span>
                      <span className="sr-only">Comments</span>
                    </Button>
                  </div>
                </div>
              </CardFooter>

              {/* Conditionally render CommentList based on expanded state */} 
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

*   **`useState(expandedComments)`**: Added state to track which posts have their comment sections expanded. It's an object where keys are `postId`s and values are booleans.
*   **`toggleComments(postId)`**: Function to update the `expandedComments` state for a specific post ID.
*   **Comment Button `onClick`**: Changed the comment button's `onClick` handler to call `toggleComments`.
*   **Conditional Rendering**: The `CommentList` component is now rendered conditionally (`{areCommentsExpanded && ...}`) below the `CardFooter`, inside a padded div, only when `expandedComments[post._id]` is true.

## 5. Running the Application

With the comments system implemented, test the new features:

```bash
npm run dev
```

1.  Navigate to the home page.
2.  Click the comment count button on any post – the comment section should appear below it, including the input form.
3.  Add a comment. It should appear in the list, and the comment count on the post should update (after a brief refetch delay).
4.  Like/Unlike comments.
5.  Delete one of your comments.
6.  Click the comment count button again to collapse the section.

## 6. Frequently Asked Questions (FAQ)

*   **Q: Why invalidate `["posts", "feed"]` when adding/deleting a comment?**
    *   A: Because the comment count is displayed *on the post card itself* in the main feed. To ensure this count is accurate after adding or deleting a comment, we need to tell React Query that the main post feed data is potentially stale, triggering a refetch.
*   **Q: Why *not* invalidate `["posts", "feed"]` when liking a comment?**
    *   A: Typically, the number of likes on a *comment* isn't displayed on the main *post* card in the feed. Therefore, liking a comment only requires invalidating the data for that specific comment list (`["comments", postId]`) to update its like count, not the entire post feed.
*   **Q: How is `postId` passed to `useDeleteComment`'s `onSuccess`?**
    *   A: React Query's `mutate` function (returned by `useMutation`) accepts a second options object. We pass `{ postId }` as variables when calling `deleteCommentMutate(comment._id, { postId })`. These variables are then passed as the second argument to the `onSuccess` callback defined in the hook.
*   **Q: Can comment fetching be paginated?**
    *   A: Absolutely. The `useCommentsQuery` could be converted to `useInfiniteQuery`, similar to `usePostsQuery`, if you expect posts to have a very large number of comments. You would then add a "Load More Comments" button within the `CommentList` component.

## What's Next?

We've now implemented the essential commenting features. The next step focuses on building out the friend system.

In **Step 7: Friend System**, we will:

1.  Implement viewing friend lists.
2.  Handle sending, accepting, declining, and canceling friend requests.
3.  Create the necessary UI components for managing friendships. 