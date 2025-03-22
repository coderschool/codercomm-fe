import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiService from '../../lib/apiService';
import { cloudinaryUpload } from '../../lib/cloudinary';
import { POSTS_PER_PAGE } from '../../lib/config';

// Get posts for feed (home page - posts from current user and friends)
export const useGetPosts = (page = 1) => {
  return useQuery({
    queryKey: ['posts', 'feed', page],
    queryFn: async () => {
      const params = { page, limit: POSTS_PER_PAGE };
      const response = await apiService.get('/posts', { params });
      return response;
    },
  });
};

// Get posts by specific user
export const useGetPostsByUser = (userId, page = 1) => {
  return useQuery({
    queryKey: ['posts', 'user', userId, page],
    queryFn: async () => {
      if (!userId) return { posts: [], totalPages: 0 };
      
      const params = { page, limit: POSTS_PER_PAGE };
      const response = await apiService.get(`/posts/user/${userId}`, { params });
      return response;
    },
    enabled: Boolean(userId),
  });
};

// Create a new post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, image }) => {
      // Upload image if provided
      let imageUrl = null;
      if (image) {
        imageUrl = await cloudinaryUpload(image);
      }
      
      // Create post
      const response = await apiService.post('/posts', {
        content,
        image: imageUrl,
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

// React to a post (like/dislike)
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
      // Update post reactions in cache
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          // Handle feed posts
          if (oldData.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map(post => 
                post._id === data.postId 
                  ? { ...post, reactions: data.reactions } 
                  : post
              ),
            };
          }
          
          return oldData;
        }
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to react to post');
    },
  });
};

// Infinite scrolling version for posts
export const useInfinitePosts = (userId = null) => {
  const endpoint = userId ? `/posts/user/${userId}` : '/posts';
  
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: POSTS_PER_PAGE };
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