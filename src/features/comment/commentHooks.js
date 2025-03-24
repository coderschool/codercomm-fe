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