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
    // Query key includes postId to cache comments per post.
    queryKey: ["comments", postId], 
    queryFn: async () => {
      console.log(`Fetching comments for post: ${postId}`);
      // Fetch all comments for now (no pagination in this hook implementation)
      const response = await apiService.get(`/posts/${postId}/comments?limit=100`); 
      // Mock API returns { comments: [], count: X, totalPages: Y }
      return response.data.comments; // Return only the comments array
    },
    enabled: !!postId, // Only run if postId is provided
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
      // commentData should contain { postId: string, content: string }
      console.log("Creating comment:", commentData);
      const response = await apiService.post("/comments", commentData);
      return response.data; // Return the newly created comment
    },
    onSuccess: (newComment) => {
      console.log("Comment created:", newComment);
      // --- Cache Update Strategy: Invalidate Related Queries ---
      // 1. Invalidate the comments query for this specific post to refetch.
      queryClient.invalidateQueries({ queryKey: ["comments", newComment.post] });
      // 2. Invalidate the main feed query to update the comment count on the post card.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      // 3. Optional: Invalidate user-specific post list if viewing that.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
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
      // DELETE request to the specific comment endpoint
      await apiService.delete(`/comments/${commentId}`);
      // Return commentId for potential optimistic updates (not used here)
      return commentId; 
    },
    // We need postId in onSuccess to invalidate the correct query
    // We can pass it through using the second argument of mutate
    onSuccess: (commentId, variables) => { 
      const { postId } = variables; // Get postId passed during mutation call
      console.log(`Comment ${commentId} deleted successfully`);
      
      // --- Cache Update Strategy: Invalidate Related Queries ---
      // 1. Invalidate comments for the specific post.
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
      // 2. Invalidate the main feed to update comment count.
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      // 3. Optional: Invalidate user-specific post lists.
      // queryClient.invalidateQueries({ queryKey: ["posts", "user"] });
      
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
    mutationFn: async ({ commentId, emoji }) => {
      console.log(`Reacting to Comment ${commentId} with ${emoji}`);
      const response = await apiService.post('/reactions', {
        targetType: 'Comment',
        targetId: commentId,
        emoji: emoji,
      });
      // Return commentId and updated reactions for cache update
      return { commentId, updatedReactions: response.data };
    },
    onSuccess: ({ commentId, updatedReactions }, variables) => {
      const { postId } = variables; // Get postId passed during mutation call
      console.log(`Reaction successful for Comment ${commentId}:`, updatedReactions);
      
      // --- Cache Update Strategy: Invalidate Comments Query ---
      // Invalidate the comments for this post to show updated reaction count/state.
      if (postId) {
         queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
      // Note: We don't necessarily need to invalidate the main post feed here,
      // as the comment reaction count isn't typically shown on the post card itself.
      
      // toast.success("Comment reaction updated");
    },
    onError: (error) => {
      console.error("Failed to react to comment:", error);
      toast.error(error.message || "Failed to update comment reaction");
    },
  });
} 