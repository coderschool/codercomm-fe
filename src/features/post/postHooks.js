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