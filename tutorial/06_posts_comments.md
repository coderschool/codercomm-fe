# Posts and Comments Feature

In this step, we'll build the posts and comments feature, which will allow users to create posts, comment on posts, and react to posts and comments.

## Create Post Hooks

First, let's create hooks for managing posts. Create or update `src/features/post/postHooks.js`:

```javascript
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '../../lib/apiService';
import { POSTS_PER_PAGE } from '../../lib/config';
import { getPaginationParams } from '../../lib/utils';

/**
 * Get posts for feed (home page - posts from current user and friends)
 * @param {number} page - Page number
 * @returns {Object} Query result with posts and pagination
 */
export const useGetPosts = (page = 1) => {
  return useQuery({
    queryKey: ['posts', 'feed', page],
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: POSTS_PER_PAGE 
      });
      const response = await apiService.get('/posts', { params });
      return response;
    },
  });
};

/**
 * Get posts by specific user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @returns {Object} Query result with posts and pagination
 */
export const useGetPostsByUser = (userId, page = 1) => {
  return useQuery({
    queryKey: ['posts', 'user', userId, page],
    queryFn: async () => {
      if (!userId) return { posts: [], totalPages: 0 };
      
      const params = getPaginationParams({ 
        page, 
        limit: POSTS_PER_PAGE 
      });
      const response = await apiService.get(`/posts/user/${userId}`, { params });
      return response;
    },
    enabled: Boolean(userId),
  });
};

/**
 * Create a new post
 * @returns {Object} Mutation result
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content }) => {
      // Create post without image
      const response = await apiService.post('/posts', {
        content,
      });
      
      return response;
    },
    onSuccess: () => {
      toast.success('Post created successfully');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

/**
 * React to a post (like/dislike)
 * @returns {Object} Mutation result
 */
export const useReactPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, emoji }) => {
      const response = await apiService.post('/reactions', {
        targetType: 'Post',
        targetId: postId,
        emoji,
      });
      
      return { postId, reactions: response };
    },
    onSuccess: (data) => {
      // Invalidate post data to refresh reactions
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to react to post');
    },
  });
};

/**
 * Get posts with infinite scrolling
 * @param {string} userId - Optional user ID to filter posts by
 * @returns {Object} Infinite query result
 */
export const useInfinitePosts = (userId = null) => {
  const endpoint = userId ? `/posts/user/${userId}` : '/posts';
  
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const params = getPaginationParams({ 
        page: pageParam, 
        limit: POSTS_PER_PAGE 
      });
      const response = await apiService.get(endpoint, { params });
      return {
        ...response,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.posts.length < POSTS_PER_PAGE) {
        return undefined; // No more pages
      }
      return lastPage.currentPage + 1;
    },
  });
};
```

## Create Comment Hooks

Now let's create hooks for managing comments. Create or update `src/features/comment/commentHooks.js`:

```javascript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '../../lib/apiService';
import { COMMENTS_PER_POST } from '../../lib/config';
import { getPaginationParams } from '../../lib/utils';

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @param {number} page - Page number
 * @returns {Object} Query result with comments and pagination
 */
export const useGetComments = (postId, page = 1) => {
  return useQuery({
    queryKey: ['comments', postId, page],
    queryFn: async () => {
      if (!postId) return { comments: [], totalPages: 0 };
      
      const params = getPaginationParams({ 
        page, 
        limit: COMMENTS_PER_POST 
      });
      const response = await apiService.get(`/posts/${postId}/comments`, { params });
      return response;
    },
    enabled: Boolean(postId),
  });
};

/**
 * Get comments with infinite scrolling
 * @param {string} postId - Post ID
 * @returns {Object} Infinite query result
 */
export const useInfiniteComments = (postId) => {
  return useInfiniteQuery({
    queryKey: ['comments', 'infinite', postId],
    queryFn: async ({ pageParam = 1 }) => {
      const params = getPaginationParams({ 
        page: pageParam, 
        limit: COMMENTS_PER_POST 
      });
      const response = await apiService.get(`/posts/${postId}/comments`, { params });
      return {
        ...response,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.comments.length < COMMENTS_PER_POST) {
        return undefined; // No more pages
      }
      return lastPage.currentPage + 1;
    },
    enabled: Boolean(postId),
  });
};

/**
 * Create a comment on a post
 * @returns {Object} Mutation result
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, content }) => {
      const response = await apiService.post('/comments', {
        content,
        postId,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      const { postId } = variables;
      toast.success('Comment added');
      
      // Invalidate comments for the post
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'infinite', postId] });
      
      // Also update post counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create comment');
    },
  });
};

/**
 * React to a comment (like/dislike)
 * @returns {Object} Mutation result
 */
export const useReactComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, emoji }) => {
      const response = await apiService.post('/reactions', {
        targetType: 'Comment',
        targetId: commentId,
        emoji,
      });
      
      return { commentId, reactions: response };
    },
    onSuccess: () => {
      // Invalidate all comment data
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to react to comment');
    },
  });
};

/**
 * Delete a comment
 * @returns {Object} Mutation result
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, postId }) => {
      const response = await apiService.delete(`/comments/${commentId}`);
      return { commentId, postId, ...response };
    },
    onSuccess: (data) => {
      const { postId } = data;
      
      toast.success('Comment deleted');
      
      // Invalidate comments for the post
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'infinite', postId] });
      
      // Also update post counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
};
```

## Create Post Components

Now let's create components for posts.

### Create PostForm Component

Create `src/features/post/PostForm.jsx`:

```jsx
import React from "react";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/features/post/postHooks";

function PostForm() {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const createPostMutation = useCreatePost();
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!e.target.value.trim()) {
      setError("Content is required");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    
    createPostMutation.mutate({ content }, {
      onSuccess: () => setContent("")
    });
  };

  const isLoading = createPostMutation.isPending;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Share what you are thinking here..."
              className="resize-none min-h-[120px]"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm font-medium text-destructive mt-1">
                {error}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PostForm;
```

### Create PostReaction Component

Create `src/features/post/PostReaction.jsx`:

```jsx
import React from "react";
import { useReactPost } from "./postHooks";

function PostReaction({ post }) {
  const reactPostMutation = useReactPost();
  
  const handleClickReaction = (emoji) => {
    if (reactPostMutation.isPending) return;
    
    reactPostMutation.mutate({
      postId: post._id,
      emoji,
    });
  };
  
  const reactions = post.reactions || {};
  const totalReactions = Object.values(reactions).reduce((acc, val) => acc + val, 0);
  
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleClickReaction("like")}
        className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
      >
        <span>👍</span>
        <span>{reactions.like || 0}</span>
      </button>
      
      <button
        onClick={() => handleClickReaction("love")}
        className="flex items-center space-x-1 text-red-500 hover:text-red-600"
      >
        <span>❤️</span>
        <span>{reactions.love || 0}</span>
      </button>
      
      <div className="text-gray-500 text-sm">
        {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
      </div>
    </div>
  );
}

export default PostReaction;
```

### Create PostCard Component

Create `src/features/post/PostCard.jsx`:

```jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DEFAULT_AVATAR } from "@/lib/config";
import PostReaction from "./PostReaction";
import CommentList from "../comment/CommentList";
import CommentForm from "../comment/CommentForm";

function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Link to={`/user/${post.userId}`}>
            <img
              src={post.author?.avatarUrl || DEFAULT_AVATAR}
              alt={post.author?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          
          <div>
            <Link to={`/user/${post.userId}`} className="font-semibold hover:underline">
              {post.author?.name}
            </Link>
            
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 whitespace-pre-wrap">
        {post.content}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="w-full border-t pt-3 pb-1">
          <PostReaction post={post} />
        </div>
        
        <div className="w-full border-t pt-3">
          <div className="flex justify-between mb-3">
            <button
              onClick={toggleComments}
              className="text-gray-600 hover:text-gray-800"
            >
              {showComments ? "Hide Comments" : `Show Comments (${post.commentCount || 0})`}
            </button>
          </div>
          
          {showComments && (
            <div className="space-y-4">
              <CommentForm postId={post._id} />
              <CommentList postId={post._id} />
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default PostCard;
```

### Create PostList Component

Create `src/features/post/PostList.jsx`:

```jsx
import React, { useState } from "react";
import PostCard from "./PostCard";
import { useGetPosts, useGetPostsByUser } from "./postHooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function PostList({ userId }) {
  const [page, setPage] = useState(1);
  
  // Choose the right query based on whether userId is provided
  const query = userId
    ? useGetPostsByUser(userId, page)
    : useGetPosts(page);
  
  const { data, isLoading, error } = query;
  
  // Extract posts and total pages from the data
  const { posts, totalPages } = data || { posts: [], totalPages: 0 };
  
  // Loading state
  if (isLoading && page === 1) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-muted-foreground">Loading posts...</span>
        </div>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Posts
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message}
          </p>
          {userId && (
            <div className="bg-muted p-3 rounded text-xs mb-4">
              <p>Debug info:</p>
              <p>User ID: {userId}</p>
              <p>Endpoint: {`/posts/user/${userId}?page=${page}&limit=5`}</p>
            </div>
          )}
          <Button variant="secondary" onClick={() => setPage(1)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <Card className="p-6">
        <div className="py-8 text-center">
          <p className="text-xl font-semibold mb-2">
            No Posts Yet
          </p>
          <p className="text-muted-foreground">
            {userId ? "This user hasn't posted anything yet." : "Your feed is empty. Follow some users to see their posts."}
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      
      <div className="flex justify-center py-4">
        {page < totalPages ? (
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setPage((page) => page + 1)}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></span>
            ) : (
              "Load more posts"
            )}
          </Button>
        ) : (
          posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No more posts to load
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default PostList;
```

## Create Comment Components

Now let's create components for comments.

### Create CommentForm Component

Create `src/features/comment/CommentForm.jsx`:

```jsx
import React, { useState } from "react";
import { useCreateComment } from "./commentHooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function CommentForm({ postId }) {
  const [content, setContent] = useState("");
  const createCommentMutation = useCreateComment();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    createCommentMutation.mutate(
      { postId, content },
      { 
        onSuccess: () => {
          setContent("");
        }
      }
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="resize-none min-h-[80px]"
        disabled={createCommentMutation.isPending}
      />
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || createCommentMutation.isPending}
          size="sm"
        >
          {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;
```

### Create CommentReaction Component

Create `src/features/comment/CommentReaction.jsx`:

```jsx
import React from "react";
import { useReactComment } from "./commentHooks";

function CommentReaction({ comment }) {
  const reactCommentMutation = useReactComment();
  
  const handleClickReaction = (emoji) => {
    if (reactCommentMutation.isPending) return;
    
    reactCommentMutation.mutate({
      commentId: comment._id,
      emoji,
    });
  };
  
  const reactions = comment.reactions || {};
  const totalReactions = Object.values(reactions).reduce((acc, val) => acc + val, 0);
  
  return (
    <div className="flex items-center space-x-3 mt-1">
      <button
        onClick={() => handleClickReaction("like")}
        className="text-xs text-blue-500 hover:text-blue-600"
      >
        👍 {reactions.like || 0}
      </button>
      
      <div className="text-gray-500 text-xs">
        {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
      </div>
    </div>
  );
}

export default CommentReaction;
```

### Create CommentCard Component

Create `src/features/comment/CommentCard.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { DEFAULT_AVATAR } from "@/lib/config";
import { useDeleteComment } from "./commentHooks";
import CommentReaction from "./CommentReaction";
import useAuth from "@/hooks/useAuth";

function CommentCard({ comment, postId }) {
  const { user } = useAuth();
  const deleteCommentMutation = useDeleteComment();
  
  const isCommentAuthor = user?.id === comment.userId;
  
  const handleDeleteComment = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ 
        commentId: comment._id,
        postId 
      });
    }
  };
  
  return (
    <div className="flex space-x-3 py-2">
      <Link to={`/user/${comment.userId}`}>
        <img
          src={comment.author?.avatarUrl || DEFAULT_AVATAR}
          alt={comment.author?.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <div className="flex justify-between items-start">
            <Link to={`/user/${comment.userId}`} className="font-medium hover:underline">
              {comment.author?.name}
            </Link>
            
            {isCommentAuthor && (
              <button
                onClick={handleDeleteComment}
                disabled={deleteCommentMutation.isPending}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                Delete
              </button>
            )}
          </div>
          
          <p className="text-gray-800 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <CommentReaction comment={comment} />
          
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
```

### Create CommentList Component

Create `src/features/comment/CommentList.jsx`:

```jsx
import React, { useState } from "react";
import { useGetComments } from "./commentHooks";
import CommentCard from "./CommentCard";
import { Button } from "@/components/ui/button";

function CommentList({ postId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetComments(postId, page);
  
  // Extract comments and totalPages from data
  const { comments, totalPages } = data || { comments: [], totalPages: 0 };
  
  if (isLoading && page === 1) {
    return (
      <div className="py-4 text-center text-gray-500">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading comments...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        Error loading comments: {error.message}
      </div>
    );
  }
  
  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        Comments ({data.totalComments || comments.length})
      </h3>
      
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard 
            key={comment._id} 
            comment={comment} 
            postId={postId} 
          />
        ))}
      </div>
      
      {page < totalPages && (
        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            {isLoading ? "Loading..." : "Load more comments"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CommentList;
```

## Update HomePage and UserProfilePage

Now let's update our main pages to include the post components.

### Update HomePage

Update `src/pages/HomePage.jsx` to include PostForm and PostList:

```jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import useAuth from "../hooks/useAuth";
import PostForm from "../features/post/PostForm";
import PostList from "../features/post/PostList";

function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Home | CoderComm</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Feed</h1>
          <p className="text-lg text-gray-700">
            Welcome back, {user.name}!
          </p>
        </div>
        
        <div className="mb-6">
          <PostForm />
        </div>
        
        <PostList />
      </div>
    </>
  );
}

export default HomePage;
```

### Update UserProfilePage

Update `src/pages/UserProfilePage.jsx` to include PostList:

```jsx
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Profile from "../features/user/Profile";
import PostList from "../features/post/PostList";
import { useGetUserProfile } from "../features/user/userHooks";
import LoadingScreen from "../components/LoadingScreen";
import useAuth from "../hooks/useAuth";

function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading } = useGetUserProfile(userId);
  
  const isCurrentUser = currentUser && userId === currentUser.id;
  
  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }
  
  return (
    <>
      <Helmet>
        <title>{user?.name || "User"} | CoderComm</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto">
        <Profile />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          <PostList userId={userId} />
        </div>
      </div>
    </>
  );
}

export default UserProfilePage;
```

## Test the Posts and Comments Feature

Run your application and test the posts and comments features:

```bash
npm run dev
```

You should be able to:
- Create new posts on the home page
- See your posts on your user profile page
- React to posts (like or love)
- Add comments to posts
- React to comments
- Delete your own comments
- Load more posts and comments when available

In the next step, we'll build the friend management features to allow users to connect with each other.