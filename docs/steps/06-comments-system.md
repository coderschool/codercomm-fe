# Step 6: Comments System

In this step, we'll implement the comments system to allow users to comment on posts. We'll add functionality to view, create, and delete comments, completing the core social interaction features of the CoderComm platform.

## 1. Understanding the Mock API Endpoints for Comments

Our mock API already includes all the endpoints we need for comments. For this step, we'll be using the following endpoints:

- `GET /api/posts/:postId/comments` - Get comments for a specific post
- `POST /api/comments` - Create a new comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/like` - Like a comment
- `DELETE /api/comments/:id/like` - Unlike a comment

Remember that you don't need to modify the mock API - it's already set up with all the functionality we need. We just need to create the frontend components to interact with these endpoints.

## 2. Create Comment Hooks with React Query

Create a new file `src/hooks/useCommentQuery.js`:

```jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

/**
 * Get comments for a post
 * @param {string} postId - ID of the post to get comments for
 */
export function useCommentsQuery(postId) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await apiService.get(`/posts/${postId}/comments`);
      return response;
    },
    enabled: !!postId,
  });
}

/**
 * Create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData) => {
      const response = await apiService.post("/comments", commentData);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch comments query for this post
      queryClient.invalidateQueries({ queryKey: ["comments", data.postId] });
      
      // Update post in cache to increment comment count
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => 
              post._id === data.postId 
                ? { ...post, comments: post.comments + 1 } 
                : post
            )
          }))
        };
      });
      
      toast.success("Comment posted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    },
  });
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }) => {
      const response = await apiService.delete(`/comments/${commentId}`);
      return { ...response, postId };
    },
    onSuccess: (data) => {
      // Invalidate and refetch comments query for this post
      queryClient.invalidateQueries({ queryKey: ["comments", data.postId] });
      
      // Update post in cache to decrement comment count
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => 
              post._id === data.postId 
                ? { ...post, comments: Math.max(0, post.comments - 1) } 
                : post
            )
          }))
        };
      });
      
      toast.success("Comment deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
}

/**
 * Like a comment
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }) => {
      const response = await apiService.post(`/comments/${commentId}/like`);
      return { ...response, postId };
    },
    onSuccess: (data) => {
      // Update comments in cache
      queryClient.setQueriesData({ queryKey: ["comments", data.postId] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          comments: oldData.comments.map(comment => 
            comment._id === data._id 
              ? { ...comment, likes: data.likes } 
              : comment
          ),
        };
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to like comment");
    },
  });
}
```

## 3. Create Comment Components

First, create a component for displaying a single comment in `src/features/comment/CommentItem.jsx`:

```jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MoreVertical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import { useDeleteComment, useLikeComment } from "@/hooks/useCommentQuery";

/**
 * Component to display a single comment
 * @param {Object} props - Component props
 * @param {Object} props.comment - Comment data object
 */
function CommentItem({ comment }) {
  const { user: currentUser } = useAuth();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();

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

  const handleLikeClick = () => {
    likeComment.mutate({ 
      commentId: comment._id, 
      postId: comment.postId 
    });
  };

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate({ 
        commentId: comment._id, 
        postId: comment.postId 
      });
    }
  };

  return (
    <div className="flex gap-3 mb-4 group">
      <Link to={`/user/${comment.author._id}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1">
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Link 
              to={`/user/${comment.author._id}`}
              className="font-medium hover:underline"
            >
              {comment.author.name}
            </Link>
            
            {currentUser?._id === comment.author._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <p className="whitespace-pre-line text-sm">{comment.content}</p>
        </div>
        
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <button 
            onClick={handleLikeClick}
            className="flex items-center hover:text-primary"
          >
            <Heart className="h-3 w-3 mr-1" />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          
          <span className="mx-2">•</span>
          
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          
          {comment.updatedAt !== comment.createdAt && (
            <>
              <span className="mx-2">•</span>
              <span>Edited</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;
```

Next, create a component for creating a new comment in `src/features/comment/CommentForm.jsx`:

```jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useCreateComment } from "@/hooks/useCommentQuery";

// Form validation schema
const commentSchema = yup.object({
  content: yup.string().required("Comment cannot be empty"),
}).required();

/**
 * Component for creating a new comment
 * @param {Object} props - Component props
 * @param {string} props.postId - ID of the post to comment on
 */
function CommentForm({ postId }) {
  const { user } = useAuth();
  const createComment = useCreateComment();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

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

  const onSubmit = async (data) => {
    try {
      await createComment.mutateAsync({
        userId: user._id,
        postId,
        content: data.content,
      });
      reset();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-3 mb-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatarUrl} alt={user?.name} />
        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 relative">
        <Input
          placeholder="Write a comment..."
          className="pr-12 py-2"
          {...register("content")}
        />
        
        <Button 
          type="submit" 
          size="icon" 
          disabled={createComment.isPending}
          className="absolute right-0 top-0 h-full rounded-l-none"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {errors.content && (
        <span className="text-destructive text-xs absolute bottom-[-20px] left-12">
          {errors.content.message}
        </span>
      )}
    </form>
  );
}

export default CommentForm;
```

Now, create a component to display comments for a post in `src/features/comment/CommentList.jsx`:

```jsx
import React from "react";
import { useCommentsQuery } from "@/hooks/useCommentQuery";
import { Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

/**
 * Component to display comments for a post and a form to add new comments
 * @param {Object} props - Component props
 * @param {string} props.postId - ID of the post to display comments for
 */
function CommentList({ postId }) {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useCommentsQuery(postId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm py-2">
        Error loading comments: {error.message || "Something went wrong"}
      </div>
    );
  }

  const comments = data?.comments || [];

  return (
    <div className="mt-4 pt-4 border-t">
      <CommentForm postId={postId} />
      
      {comments.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm py-4">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="mt-4">
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentList;
```

## 4. Update the Post Card Component

Now, let's modify the `PostList` component to include a toggle for showing and hiding comments. Update `src/features/post/PostList.jsx`:

```jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import { useLikePost, useUnlikePost, useDeletePost } from "@/hooks/usePostQuery";
import CommentList from "@/features/comment/CommentList";

/**
 * Component to display a list of posts
 * @param {Object} props - Component props
 * @param {Array} props.posts - List of posts to display
 */
function PostList({ posts = [] }) {
  const { user: currentUser } = useAuth();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const deletePost = useDeletePost();
  
  // Track which posts have comments expanded
  const [expandedComments, setExpandedComments] = useState({});

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

  const handleLikeClick = (postId) => {
    // In a real app, we would check if the user has already liked the post
    // For this tutorial, we'll just increment the like count
    likePost.mutate(postId);
  };

  const handleUnlikeClick = (postId) => {
    unlikePost.mutate(postId);
  };

  const handleDeleteClick = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate(postId);
    }
  };
  
  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
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

            {currentUser?._id === post.author._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(post._id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="mb-4">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
          
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center text-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleLikeClick(post._id)}
                className="flex items-center mr-2 text-muted-foreground"
              >
                <Heart className="h-4 w-4 mr-1" />
                <span>{post.likes} likes</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleComments(post._id)}
                className="flex items-center text-muted-foreground"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.comments} comments</span>
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {post.updatedAt !== post.createdAt && (
                <span>(Edited)</span>
              )}
            </div>
          </div>
          
          {/* Show comments when expanded */}
          {expandedComments[post._id] && (
            <CommentList postId={post._id} />
          )}
        </div>
      ))}
    </div>
  );
}

export default PostList;
```

## 5. Update the Import Statement in Profile Page

Make sure the `ProfilePage` component correctly imports the updated `PostList` component:

```jsx
// In src/pages/ProfilePage.jsx
import PostList from "@/features/post/PostList";
```

## 6. Create a Detail View for a Single Post (Optional)

If you want to create a dedicated page for viewing a single post with all its comments, you can create a `PostDetailPage.jsx` component:

```jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PostList from "@/features/post/PostList";

/**
 * Page for viewing a single post with all its comments
 */
function PostDetailPage() {
  const { id } = useParams();
  
  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["posts", id],
    queryFn: async () => {
      const response = await apiService.get(`/posts/${id}`);
      return response;
    },
  });

  if (isLoading) {
    return <LoadingScreen message="Loading post..." />;
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded mb-4">
        <h3 className="font-bold text-lg">Error loading post</h3>
        <p>{error.message || "Failed to load post"}</p>
        <Button 
          asChild
          variant="outline" 
          className="mt-2"
        >
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <PostList posts={[post]} />
      </div>
    </div>
  );
}

export default PostDetailPage;
```

If you implement this page, remember to update your routes in `src/routes/index.jsx`:

```jsx
// In the routes file, add:
<Route path="post/:id" element={<PostDetailPage />} />
```

## 7. Running the Application

With the comments system implemented, start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`, log in, and try these features:

1. Click on the comments button on a post to expand the comments section
2. Add a new comment to a post
3. View existing comments
4. Like comments
5. Delete your own comments

## 8. What You've Learned

Congratulations! You've successfully built a social media application with React. Here's a summary of what you've learned:

1. **Project Setup**:
   - Setting up a React project with Vite
   - Configuring Tailwind CSS and UI components
   - Implementing absolute imports

2. **Authentication System**:
   - Creating login and registration pages
   - Implementing JWT-based authentication
   - Setting up protected routes

3. **Layouts and Navigation**:
   - Creating responsive layouts
   - Building a sidebar navigation system
   - Implementing mobile-friendly UI components

4. **User Profiles**:
   - Displaying user information
   - Editing user profiles
   - Showing a user's posts

5. **Post System**:
   - Creating and displaying posts
   - Building an infinite scrolling feed
   - Implementing post interactions (like, delete)

6. **Comments System**:
   - Creating and displaying comments
   - Implementing comment interactions (like, delete)
   - Building a nested UI for post discussions

7. **State Management and API Integration**:
   - Using Zustand for global state
   - Implementing React Query for data fetching
   - Managing complex UI state

8. **Advanced React Patterns**:
   - Custom hooks for reusable logic
   - Component composition for UI organization
   - Form handling with validation

## 9. Next Steps and Future Enhancements

Here are some ideas for enhancing your CoderComm application:

1. **Real-time Features**:
   - Implement WebSockets for real-time notifications
   - Add live updates for comments and likes

2. **Media Sharing**:
   - Add image and file upload capabilities
   - Implement a gallery view for photos

3. **Friend System**:
   - Complete the friend request and acceptance functionality
   - Add a friend recommendation system

4. **Search Functionality**:
   - Implement search for users and posts
   - Add filters for search results

5. **Notifications**:
   - Create a notification system for likes, comments, and friend requests
   - Implement read/unread status for notifications

6. **Direct Messaging**:
   - Build a private messaging system
   - Add read receipts and typing indicators

7. **Advanced UI**:
   - Implement a dark mode toggle
   - Add animations and transitions
   - Improve accessibility

8. **Performance Optimization**:
   - Implement code splitting for better load times
   - Add caching strategies for API responses
   - Optimize component re-renders

You now have a solid foundation to build upon and extend with these advanced features. Happy coding! 