import { useQueryClient } from '@tanstack/react-query';
import { POSTS_PER_PAGE } from '@/lib/config';
import { getPaginationParams } from '@/lib/utils';
import { useAPIQuery, useAPIMutation, useAPIInfiniteQuery } from '@/hooks/useAPIQuery';

/**
 * Get posts for feed (home page - posts from current user and friends)
 * @param {number} page - Page number
 * @returns {Object} Query result with posts and pagination
 */
export const useGetPosts = (page = 1) => {
  const params = getPaginationParams({ page, limit: POSTS_PER_PAGE });
  
  return useAPIQuery(
    ['posts', 'feed', page],
    '/posts',
    { params }
  );
};

/**
 * Get posts by specific user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @returns {Object} Query result with posts and pagination
 */
export const useGetPostsByUser = (userId, page = 1) => {
  const params = getPaginationParams({ page, limit: POSTS_PER_PAGE });
  
  return useAPIQuery(
    ['posts', 'user', userId, page],
    `/posts/user/${userId}`,
    {
      params,
      enabled: Boolean(userId),
      select: (data) => data || { posts: [], totalPages: 0 }
    }
  );
};

/**
 * Create a new post
 * @returns {Object} Mutation result
 */
export const useCreatePost = () => {
  return useAPIMutation({
    feature: 'posts',
    endpoint: '/posts',
    method: 'post',
    invalidateQueries: [['posts']],
    successMessage: 'Post created successfully',
    errorMessage: 'Failed to create post'
  });
};

/**
 * React to a post (like/dislike)
 * @returns {Object} Mutation result
 */
export const useReactPost = () => {
  return useAPIMutation({
    feature: 'posts',
    endpoint: '/reactions',
    method: 'post',
    invalidateQueries: [['posts']],
    errorMessage: 'Failed to react to post',
    onSuccess: (data, variables) => {
      // We don't need a success toast for reactions
    }
  });
};

/**
 * Get posts with infinite scrolling
 * @param {string} userId - Optional user ID to filter posts by
 * @returns {Object} Infinite query result
 */
export const useInfinitePosts = (userId = null) => {
  const endpoint = userId ? `/posts/user/${userId}` : '/posts';
  
  return useAPIInfiniteQuery(
    ['posts', 'infinite', userId],
    endpoint,
    { limit: POSTS_PER_PAGE }
  );
};