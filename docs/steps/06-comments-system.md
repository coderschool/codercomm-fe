# Step 6: Comments System

In this step, we'll implement the comments system, allowing users to view, add, react to, and delete comments on posts. This involves:

1.  **Creating Comment Hooks:** Using React Query to fetch, create, react to, and delete comments.
2.  **Building Comment Components:** Creating components to display individual comments (`CommentItem`), the comment input form (`CommentForm`), and the list of comments for a post (`CommentList`).
3.  **Integrating Comments into Posts:** Updating the `PostList` component to show/hide and render the `CommentList`.

## 1. Understanding the Mock API Endpoints for Comments

Let's clarify the relevant mock API endpoints:

*   `GET /api/posts/:postId/comments`: Fetches comments for a specific post.
*   `POST /api/comments`: Creates a new comment (requires `content` and `postId`).
*   `DELETE /api/comments/:commentId`: Deletes a specific comment (user must be the author).
*   `POST /api/reactions`: Creates/updates/removes a reaction on a comment (requires `{ targetType: 'Comment', targetId: commentId, emoji }`).

## 2. Create Comment Hooks with React Query

We need hooks specifically for comment data.

Create/Update `src/hooks/useCommentQuery.js`:

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
    queryKey: ["comments", postId], 
    queryFn: async () => {
      console.log(`Fetching comments for post: ${postId}`);
      const response = await apiService.get(`/posts/${postId}/comments`); 
      return response.comments || []; // Return only the comments array
    },
    enabled: !!postId, 
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
      console.log("Creating comment:", commentData);
      const response = await apiService.post("/comments", commentData);
      return response; // Return the newly created comment
    },
    onSuccess: (newComment) => {
      console.log("Comment created:", newComment);
      // Invalidate comments query for the specific post
      queryClient.invalidateQueries({ queryKey: ["comments", newComment.post] });
      // Also invalidate post queries to update comment count. 
      // Invalidate specific user posts query, as that's where counts are displayed.
      queryClient.invalidateQueries({ queryKey: ["posts", "user"] }); // Broad invalidation for simplicity
      // A more targeted approach would be queryClient.invalidateQueries({ queryKey: ["posts", "user", postAuthorId] });
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
      await apiService.delete(`/comments/${commentId}`);
      return commentId; 
    },
    // Pass postId in variables when calling mutate: deleteCommentMutate(commentId, { postId })
    onSuccess: (commentId, variables) => { 
      const { postId } = variables;
      console.log(`Comment ${commentId} deleted successfully`);
      // Invalidate comments query for the specific post
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
      // Also invalidate post queries to update comment count
      queryClient.invalidateQueries({ queryKey: ["posts", "user"] }); // Broad invalidation for simplicity
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
    // Pass postId in variables when calling mutate: reactToCommentMutate({ commentId, emoji, postId })
    mutationFn: async ({ commentId, emoji }) => {
      console.log(`Reacting to Comment ${commentId} with ${emoji}`);
      const response = await apiService.post('/reactions', {
        targetType: 'Comment',
        targetId: commentId,
        emoji: emoji,
      });
      return { commentId, updatedReactions: response };
    },
    onSuccess: ({ commentId, updatedReactions }, variables) => {
      const { postId } = variables;
      console.log(`Reaction successful for Comment ${commentId}:`, updatedReactions);
      // Invalidate comments query for the specific post to show updated reaction state
      if (postId) {
         queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
    },
    onError: (error) => {
      console.error("Failed to react to comment:", error);
      toast.error(error.message || "Failed to update comment reaction");
    },
  });
}
```

**Explanation:**

*   **`useCommentsQuery`**: Fetches all comments for a given post ID using `useQuery`.
*   **Mutations**: `onSuccess` callbacks correctly invalidate the `["comments", postId]` query to refetch comments after changes. They also invalidate the relevant user post query (`["posts", "user"]`) to ensure comment counts displayed on posts are updated.

## 3. Create Comment Components

These components display and handle comment interactions. Ensure utilities like `getInitials` and `formatDistanceToNow` are imported, not redefined locally.

Verify `src/features/comment/CommentItem.jsx`:

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

function CommentItem({ comment, postId }) {
  const { user: currentUser } = useAuth();
  const { mutate: reactToCommentMutate, isPending: isReacting } = useReactToComment();
  const { mutate: deleteCommentMutate, isPending: isDeleting } = useDeleteComment();

  const handleReaction = () => {
    if (isReacting) return;
    reactToCommentMutate({ 
        commentId: comment._id, 
        emoji: 'like',
        postId: postId 
    });
  };

  const handleDeleteClick = () => {
    if (isDeleting) return;
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutate(comment._id, { postId: postId });
    }
  };
  
  const isLikedByCurrentUser = comment.reactions?.some(
      r => r.author._id === currentUser?._id && r.emoji === 'like'
  );
  const isCommentAuthor = currentUser?._id === comment.author._id;

  return (
    <div className="flex gap-3 py-2">
      <Link to={`/user/${comment.author._id}`} className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={comment.author.avatarUrl || ''} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 group">
        <div className="bg-muted px-3 py-2 rounded-lg relative">
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
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive text-xs flex items-center gap-2 cursor-pointer" disabled={isDeleting}>
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <Link to={`/user/${comment.author._id}`} className="text-xs font-semibold hover:underline">
            {comment.author.name}
          </Link>
          <p className="text-sm whitespace-pre-wrap mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-1 text-xs text-muted-foreground">
          <Button variant="ghost" size="xs" onClick={handleReaction} disabled={isReacting} className={cn("flex items-center gap-0.5 h-auto p-0 hover:text-primary", isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground')}>
            <Heart className={cn("h-3 w-3", isLikedByCurrentUser && 'fill-primary')} />
            <span className="ml-0.5">{comment.reactions?.filter(r => r.emoji === 'like').length || 0}</span>
            <span className="sr-only">Likes</span>
          </Button>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          {comment.updatedAt && comment.createdAt !== comment.updatedAt && (<><span>•</span><span>Edited</span></>)}
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

Verify `src/features/comment/CommentForm.jsx`:

```jsx
// src/features/comment/CommentForm.jsx
import React from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuth from "@/hooks/useAuth";
import { useCreateComment } from "@/hooks/useCommentQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Send, Loader2 } from "lucide-react";
import { getInitials } from "@/utils/formatters";

const commentSchema = yup.object({ content: yup.string().required("Comment cannot be empty").trim() }).required();

function CommentForm({ postId }) {
  const { user } = useAuth();
  const { mutate: createCommentMutate, isPending: isCreatingComment } = useCreateComment();
  
  const form = useForm({ resolver: yupResolver(commentSchema), defaultValues: { content: "" } });

  const onSubmit = (data) => {
    createCommentMutate({ postId, content: data.content }, { onSuccess: () => form.reset() });
  };

  if (!user) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-3 py-2">
        <Avatar className="h-8 w-8 border mt-1 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1 relative">
              <FormControl>
                <div className="relative">
                  <Input placeholder="Write a comment..." className="pr-10 h-9 text-sm" {...field} disabled={isCreatingComment}/>
                  <Button type="submit" size="icon" variant="ghost" disabled={isCreatingComment || !form.formState.isValid} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary">
                    {isCreatingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

CommentForm.propTypes = { postId: PropTypes.string.isRequired };
export default CommentForm;
```

Verify `src/features/comment/CommentList.jsx`:

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

function CommentList({ postId }) {
  const { data: comments, isLoading, isError, error } = useCommentsQuery(postId);

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <CommentForm postId={postId} />
      {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
      {isError && (
        <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs">{error?.message || "Could not load comments."}</AlertDescription>
        </Alert>
      )}
      {!isLoading && !isError && (
        <> 
          {comments?.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">No comments yet. Be the first!</div>
          ) : (
            <div className="mt-4 space-y-2">
              {comments?.map(comment => (
                <CommentItem key={comment._id} comment={comment} postId={postId} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

CommentList.propTypes = { postId: PropTypes.string.isRequired };
export default CommentList;
```

## 4. Update the Post List Component

Modify `src/features/post/PostList.jsx` to include the `CommentList` and add the button to toggle its visibility.

```jsx
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