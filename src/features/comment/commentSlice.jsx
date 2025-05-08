import apiService from "@/lib/apiService";
import { toast } from "sonner";

export const commentSlice = (set, get) => ({
  // Comments State
  // Structure: { postId: { list: [], isLoading: false, error: null, totalPages: 1 } }
  // Note: Global loading/error states might be less useful for comments fetched per-post
  // We'll manage loading/error within the comments[postId] object.
  comments: {},

  // Comment Actions
  fetchComments: async (postId, page = 1, limit = 5) => {
    // Set loading state specifically for this post's comments
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: {
          ...state.comments[postId],
          isLoading: true,
          error: null,
        },
      },
    }));
    try {
      const response = await apiService.get(`/posts/${postId}/comments`, {
        params: { page, limit },
      });
      // Assuming API returns { comments: [...], totalPages: X }
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: {
            list: response.comments || [],
            totalPages: response.totalPages || 1,
            isLoading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      console.error(`Fetch Comments Error (Post ${postId}):`, error);
      const errorMessage = error?.message || "Failed to fetch comments";
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: {
            ...state.comments[postId],
            isLoading: false,
            error: errorMessage,
          },
        },
      }));
      toast.error(errorMessage);
    }
  },

  createComment: async (postId, commentData) => {
    console.log(`Attempting to create comment on post ${postId}:`, commentData);
    try {
      const newComment = await apiService.post(
        `/posts/${postId}/comments`,
        commentData
      );
      toast.success("Comment added successfully!");
      console.log("✅ Comment created:", newComment);
      set((state) => {
        const postComments = state.comments[postId] || {
          list: [],
          isLoading: false,
          error: null,
        };
        let authorId = null;
        const updatedUserPosts = { ...state.userPosts };

        // Find the post in userPosts cache to update count
        for (const userId in updatedUserPosts) {
          const postIndex = updatedUserPosts[userId]?.list?.findIndex(
            (p) => p._id === postId
          );
          if (postIndex !== -1) {
            authorId = userId;
            updatedUserPosts[userId].list[postIndex] = {
              ...updatedUserPosts[userId].list[postIndex],
              commentCount:
                (updatedUserPosts[userId].list[postIndex].commentCount || 0) +
                1,
            };
            break;
          }
        }

        return {
          comments: {
            ...state.comments,
            [postId]: {
              ...postComments,
              list: [newComment, ...(postComments.list || [])],
            },
          },
          userPosts: updatedUserPosts, // Update user posts with new count
        };
      });
      return newComment;
    } catch (error) {
      console.error(`❌ Create Comment Error (Post ${postId}):`, error);
      toast.error(error.message || "Failed to add comment");
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    console.log(`Attempting to delete comment ${commentId}...`);
    try {
      await apiService.delete(`/comments/${commentId}`);
      toast.success("Comment deleted successfully!");
      set((state) => {
        let postIdToUpdate = null;
        let authorId = null;
        const updatedComments = { ...state.comments };
        const updatedPosts = [...state.posts];
        const updatedUserPosts = { ...state.userPosts };

        for (const postId in updatedComments) {
          const commentIndex = updatedComments[postId]?.list?.findIndex(
            (c) => c._id === commentId
          );
          if (commentIndex !== -1) {
            postIdToUpdate = postId;
            updatedComments[postId] = {
              ...updatedComments[postId],
              list: updatedComments[postId].list.filter(
                (c) => c._id !== commentId
              ),
            };
            break;
          }
        }

        if (postIdToUpdate) {
          // Update main post list count
          const postIndex = updatedPosts.findIndex(
            (p) => p._id === postIdToUpdate
          );
          if (postIndex !== -1) {
            authorId = updatedPosts[postIndex].author._id;
            updatedPosts[postIndex] = {
              ...updatedPosts[postIndex],
              commentCount: Math.max(
                0,
                (updatedPosts[postIndex].commentCount || 0) - 1
              ),
            };
          }
          // Update user-specific post list count
          if (authorId && updatedUserPosts[authorId]?.list) {
            const userPostIndex = updatedUserPosts[authorId].list.findIndex(
              (p) => p._id === postIdToUpdate
            );
            if (userPostIndex !== -1) {
              updatedUserPosts[authorId].list[userPostIndex] = {
                ...updatedUserPosts[authorId].list[userPostIndex],
                commentCount: Math.max(
                  0,
                  (updatedUserPosts[authorId].list[userPostIndex]
                    .commentCount || 0) - 1
                ),
              };
            }
          }
        }

        return {
          comments: updatedComments,
          posts: updatedPosts,
          userPosts: updatedUserPosts,
        };
      });
      console.log(`✅ Comment ${commentId} deleted.`);
    } catch (error) {
      console.error(`❌ Delete Comment Error (${commentId}):`, error);
      const errorMessage = error.message || "Failed to delete comment";
      toast.error(errorMessage);
      throw error;
    }
  },

  reactToComment: async (commentId, reactionType) => {
    // Similar problem to delete: need postId for efficient refetch/update.
    try {
      await apiService.post(`/comments/${commentId}/react`, {
        reactionType,
      });
      // Solution: Refetch the specific comment list or update locally
      // Let's update locally for now to avoid needing postId explicitly passed.
      set((state) => {
        const updatedComments = { ...state.comments };
        let postIdToUpdate = null;
        let userId = state.currentUser?._id;
        if (!userId) return state; // Need user to update reaction state

        for (const postId in updatedComments) {
          const commentIndex = updatedComments[postId]?.list?.findIndex(
            (c) => c._id === commentId
          );
          if (commentIndex !== -1) {
            postIdToUpdate = postId;
            const comment = updatedComments[postId].list[commentIndex];
            const existingReactionIndex = comment.reactions?.findIndex(
              (r) => r.author._id === userId && r.emoji === reactionType
            );

            let newReactions = [...(comment.reactions || [])];
            if (existingReactionIndex !== -1) {
              // User already reacted with this type, remove reaction (toggle off)
              newReactions.splice(existingReactionIndex, 1);
            } else {
              // Add new reaction (assuming API handles backend logic)
              // We don't have the full reaction object back, so make a placeholder
              newReactions.push({
                author: { _id: userId },
                emoji: reactionType,
              });
              // Note: This is a simplification. A real app might need author details.
            }

            updatedComments[postId].list[commentIndex] = {
              ...comment,
              reactions: newReactions,
            };
            break;
          }
        }
        return { comments: updatedComments };
      });
    } catch (error) {
      console.error(`React to Comment Error (Comment ${commentId}):`, error);
      const errorMessage = error?.message || "Failed to react to comment";
      toast.error(errorMessage);
    }
  },
});
