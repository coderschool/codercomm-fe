import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

// --- Hook: usePostsQuery (Infinite Scroll) ---
/**
 * Fetches paginated posts for the main feed using infinite scrolling.
 * Uses React Query's `useInfiniteQuery`.
 */
export function usePostsQuery() {
  return useInfiniteQuery({
    // queryKey: Base key for this infinite query.
    queryKey: ["posts", "feed"], // Unique key for the feed posts
    
    // queryFn: Function to fetch a single page of data.
    // Receives an object containing `pageParam` (which we define below).
    queryFn: async ({ pageParam = 1 }) => {
      console.log(`Fetching posts page: ${pageParam}`);
      // Request posts for the given page number.
      const response = await apiService.get(`/posts?page=${pageParam}&limit=5`); // Use limit=5 for demo
      // Return the data structure expected by React Query, typically the API response data.
      // Our mock API returns { posts: [], count: X, totalPages: Y }
      return response.data;
    },
    
    // initialPageParam: The page number to fetch initially.
    initialPageParam: 1,
    
    // getNextPageParam: Function to determine the page number for the *next* fetch.
    // Receives the `lastPage` data (from the last successful queryFn call) 
    // and `allPages` data (array of all fetched pages).
    getNextPageParam: (lastPage, allPages) => {
      // Our API returns `totalPages`. If the current page number is less than totalPages, return the next page number.
      const currentPage = allPages.length; // Current number of pages fetched
      if (currentPage < lastPage.totalPages) {
        return currentPage + 1; // Return the next page number to fetch
      } else {
        return undefined; // No more pages to load
      }
    },
  });
}

// --- Hook: useCreatePost ---
/**
 * Provides a mutation function to create a new post.
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      // postData should contain { content: string, image?: string }
      console.log("Creating post:", postData);
      const response = await apiService.post('/posts', postData);
      return response.data; // Return the newly created post
    },
    onSuccess: (newPost) => {
      console.log("Post created successfully:", newPost);
      // --- Cache Update Strategy: Invalidate Feed Query ---
      // After creating a post, the feed data is stale.
      // Invalidate the entire feed query to trigger a refetch from page 1.
      // This ensures the new post appears at the top.
      // Note: This is simpler than manually inserting the new post into the cache.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      
      // Optional: Could also invalidate the user-specific posts query for the author
      // if (newPost.author?._id) {
      //   queryClient.invalidateQueries({ queryKey: ["posts", "user", newPost.author._id] });
      // }
      
      toast.success("Post created successfully");
    },
    onError: (error) => {
      console.error("Failed to create post:", error);
      toast.error(error.message || "Failed to create post");
    },
  });
}

// --- Hook: useReactToPost ---
/**
 * Provides a mutation function to react (like/unlike) a post.
 * Uses the single POST /reactions endpoint from the mock API.
 */
export function useReactToPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, emoji }) => {
      // The API expects targetType, targetId, emoji
      console.log(`Reacting to Post ${postId} with ${emoji}`);
      const response = await apiService.post('/reactions', {
        targetType: 'Post',
        targetId: postId,
        emoji: emoji,
      });
      // The mock API returns the updated list of reactions for the target
      return { postId, updatedReactions: response.data }; 
    },
    onSuccess: ({ postId, updatedReactions }) => {
      console.log(`Reaction successful for Post ${postId}:`, updatedReactions);
      // --- Cache Update Strategy: Invalidate Feed Query ---
      // Since the reaction count changes, invalidate the feed.
      // This is simpler than manually updating the reaction count/array within the infinite query cache.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      
      // Optional: Could also invalidate user-specific post lists if needed
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
      // toast.success("Reaction updated"); // Optional: notification for reaction
    },
    onError: (error) => {
      console.error("Failed to react to post:", error);
      toast.error(error.message || "Failed to update reaction");
    },
  });
}

// --- Hook: useDeletePost ---
/**
 * Provides a mutation function to delete a post.
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      console.log(`Deleting post: ${postId}`);
      // DELETE requests often don't return a body, just a status code (e.g., 204)
      await apiService.delete(`/posts/${postId}`);
      return postId; // Return the postId for potential cache updates
    },
    onSuccess: (postId) => {
      console.log(`Post ${postId} deleted successfully`);
      // --- Cache Update Strategy: Invalidate Feed Query ---
      // After deleting a post, invalidate the feed query to remove it.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });

      // Optional: Remove the post directly from the cache for a faster UI update
      // This is more complex with infinite queries.
      // queryClient.setQueryData(["posts", "feed"], (oldData) => ... remove post ... );

      // Also invalidate user-specific post lists if needed
      // We need the author ID for this, which isn't returned by the DELETE response.
      // Could potentially get it from the cache before invalidating if needed.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Failed to delete post");
    },
  });
} 