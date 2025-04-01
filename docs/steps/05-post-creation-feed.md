# Step 5: Post Creation and Feed

In this step, we'll implement the post creation feature and display a feed of posts on the home page. Users will be able to create new posts, view posts from themselves and others, and interact with posts through likes and comments.

## 1. Understanding the Mock API Endpoints for Posts

Our mock API already includes all the endpoints we need for posts. For this step, we'll be using the following endpoints:

- `GET /api/posts` - Get all posts (feed) with pagination
- `GET /api/posts/user/:userId` - Get posts by a specific user
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post
- `DELETE /api/posts/:id` - Delete a post

Remember that you don't need to modify the mock API - it's already set up with all the functionality we need. We just need to create the frontend components to interact with these endpoints.

## 2. Create Post Service with React Query Hooks

Create a new file `src/hooks/usePostQuery.js`:

```jsx
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

/**
 * Get paginated posts for the feed
 */
export function usePostsQuery() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.get(`/posts?page=${pageParam}&limit=5`);
      return response;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = Math.ceil(lastPage.posts.length / 5);
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
  });
}

/**
 * Create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      const response = await apiService.post('/posts', postData);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch posts query
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });
}

/**
 * Like a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const response = await apiService.post(`/posts/${postId}/like`);
      return response;
    },
    onSuccess: (data) => {
      // Update post in cache
      queryClient.setQueryData(["posts", data._id], data);
      
      // Update post in infinite query cache
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => 
              post._id === data._id ? { ...post, likes: data.likes } : post
            )
          }))
        };
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to like post");
    },
  });
}

/**
 * Unlike a post
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const response = await apiService.delete(`/posts/${postId}/like`);
      return response;
    },
    onSuccess: (data) => {
      // Update post in cache
      queryClient.setQueryData(["posts", data._id], data);
      
      // Update post in infinite query cache
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => 
              post._id === data._id ? { ...post, likes: data.likes } : post
            )
          }))
        };
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unlike post");
    },
  });
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const response = await apiService.delete(`/posts/${postId}`);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch posts query
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      // Also invalidate user posts query if applicable
      if (data.author && data.author._id) {
        queryClient.invalidateQueries({ queryKey: ["posts", "user", data.author._id] });
      }
      
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });
}
```

## 3. Create a Post Creation Component

Create a component for creating new posts in `src/features/post/PostForm.jsx`:

```jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image, Send } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/usePostQuery";

// Form validation schema
const postSchema = yup.object({
  content: yup.string().required("Please enter something to post"),
}).required();

/**
 * Component for creating a new post
 */
function PostForm() {
  const { user } = useAuth();
  const createPost = useCreatePost();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(postSchema),
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
      await createPost.mutateAsync({
        userId: user._id,
        content: data.content,
      });
      reset();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder={`What's on your mind, ${user?.name.split(' ')[0]}?`}
                className="resize-none min-h-[100px]"
                {...register("content")}
              />
              {errors.content && (
                <p className="text-destructive text-sm mt-1">{errors.content.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t px-6 py-3">
          <Button type="button" variant="ghost" className="text-muted-foreground">
            <Image className="h-4 w-4 mr-2" />
            Add Image
          </Button>
          
          <Button 
            type="submit" 
            disabled={createPost.isPending}
            className="px-6"
          >
            {createPost.isPending ? "Posting..." : "Post"}
            <Send className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PostForm;
```

## 4. Enhance the Post List Component

Update the `PostList` component to handle interactions in `src/features/post/PostList.jsx`:

```jsx
import React from "react";
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
        </div>
      ))}
    </div>
  );
}

export default PostList;
```

## 5. Create a Feed Component with Infinite Loading

Create a new component for the feed with infinite scrolling in `src/features/post/Feed.jsx`:

```jsx
import React, { useEffect } from "react";
import { usePostsQuery } from "@/hooks/usePostQuery";
import PostList from "./PostList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

/**
 * Feed component with infinite scrolling
 */
function Feed() {
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage 
  } = usePostsQuery();
  
  // Setup intersection observer for infinite scrolling
  const { ref, inView } = useInView();

  // Load more posts when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded mb-4">
        <h3 className="font-bold text-lg">Error loading posts</h3>
        <p>{error.message || "Failed to load posts"}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Flatten all posts from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div>
      <PostList posts={posts} />
      
      {/* Load more trigger */}
      {hasNextPage && (
        <div
          ref={ref}
          className="flex justify-center p-4"
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
      
      {/* End of posts message */}
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center p-4 text-muted-foreground">
          You've reached the end of the feed.
        </div>
      )}
    </div>
  );
}

export default Feed;
```

## 6. Update the Home Page

Update the home page to include the post form and feed in `src/pages/HomePage.jsx`:

```jsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import PostForm from "@/features/post/PostForm";
import Feed from "@/features/post/Feed";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Home page component
 * Displays post creation form and feed
 */
function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home Feed</h1>
      
      <div className="max-w-2xl mx-auto">
        <PostForm />
        <Feed />
      </div>
    </div>
  );
}

export default HomePage;
```

## 7. Install Additional Dependencies

You may need to install the `react-intersection-observer` library for infinite scrolling:

```bash
npm install react-intersection-observer
```

## 8. Running the Application

With the post creation and feed system implemented, start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`, log in, and try these features:

1. Create a new post from the home page
2. View the feed of posts
3. Like posts
4. Delete your own posts
5. Scroll down to load more posts with infinite scrolling

## What's Next?

In the next step, we'll implement the comments system, allowing users to:

1. View comments on posts
2. Add new comments
3. Reply to existing comments
4. Edit and delete their own comments

This will complete the core social interaction features of the CoderComm platform. 