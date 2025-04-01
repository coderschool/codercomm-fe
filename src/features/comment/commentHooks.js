import { COMMENTS_PER_POST } from '@/lib/config';
import { getPaginationParams } from '@/lib/utils';
import { useAPIQuery, useAPIMutation, useAPIInfiniteQuery } from '@/hooks/useAPIQuery';

/**
 * Get comments for a post with pagination
 * @param {string} postId - Post ID
 * @param {number} page - Page number
 * @returns {Object} Query result with comments and pagination
 */
export const useGetComments = (postId, page = 1) => {
  const params = getPaginationParams({ page, limit: COMMENTS_PER_POST });
  
  return useAPIQuery(
    ['comments', postId, page],
    `/posts/${postId}/comments`,
    {
      params,
      enabled: Boolean(postId)
    }
  );
};

/**
 * Get comments with infinite scrolling
 * @param {string} postId - Post ID
 * @returns {Object} Infinite query result
 */
export const useInfiniteComments = (postId) => {
  return useAPIInfiniteQuery(
    ['comments', 'infinite', postId],
    `/posts/${postId}/comments`,
    {
      limit: COMMENTS_PER_POST,
      enabled: Boolean(postId)
    }
  );
};

/**
 * Create a comment on a post
 * @returns {Object} Mutation result
 */
export const useCreateComment = () => {
  return useAPIMutation({
    feature: 'comments',
    endpoint: '/comments',
    method: 'post',
    invalidateQueries: [['comments'], ['posts']],
    successMessage: 'Comment added',
    errorMessage: 'Failed to create comment'
  });
};

/**
 * React to a comment (like/dislike)
 * @returns {Object} Mutation result
 */
export const useReactComment = () => {
  return useAPIMutation({
    feature: 'comments',
    endpoint: '/reactions',
    method: 'post',
    invalidateQueries: [['comments']],
    errorMessage: 'Failed to react to comment',
    onSuccess: () => {
      // No success toast needed for reactions
    }
  });
};

/**
 * Delete a comment
 * @returns {Object} Mutation result
 */
export const useDeleteComment = () => {
  return useAPIMutation({
    feature: 'comments',
    endpoint: '/comments',
    method: 'delete',
    invalidateQueries: [['comments'], ['posts']],
    successMessage: 'Comment deleted',
    errorMessage: 'Failed to delete comment'
  });
};