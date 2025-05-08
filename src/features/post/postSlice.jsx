import apiService from "@/lib/apiService";
import { toast } from "sonner";

export const postSlice = (set, get) => ({
  // Posts State
  // Store posts per user ID
  // Example: { userId1: { list: [], isLoading: false, error: null, totalPages: 1 }, userId2: ... }
  userPosts: {},
  posts: [],
  isLoadingPosts: false,
  postsError: null,
  totalPostPages: 1, // Assuming pagination might be needed later

  // Post Actions
  fetchPosts: async (page = 1, limit = 10) => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      // Assuming your API endpoint for fetching posts is /posts
      // Adjust query params as needed (e.g., for pagination)
      const response = await apiService.get("/posts", {
        params: { page, limit },
      });
      // Assuming the API returns data like { posts: [...], totalPages: X }
      set({
        posts: response.posts || [],
        totalPostPages: response.totalPages || 1,
        isLoadingPosts: false,
      });
    } catch (error) {
      console.error("Fetch Posts Error:", error);
      const errorMessage = error?.message || "Failed to fetch posts";
      set({ isLoadingPosts: false, postsError: errorMessage });
      toast.error(errorMessage);
    }
  },
  /**
   * Fetches posts for a specific user.
   * @param {string} userId
   * @param {number} page
   * @param {number} limit
   */
  fetchUserPosts: async (userId, page = 1, limit = 10) => {
    const existingPostsState = get().userPosts[userId];
    // Avoid refetch if already loading (can add logic to check if data exists too)
    if (existingPostsState?.isLoading) return;

    set((state) => ({
      userPosts: {
        ...state.userPosts,
        [userId]: {
          ...(state.userPosts[userId] || {}),
          isLoading: true,
          error: null,
        },
      },
    }));
    console.log(`Attempting fetch posts for user ${userId}...`);
    try {
      // Assuming endpoint like /posts/user/:userId
      const response = await apiService.get(`/posts/user/${userId}`, {
        params: { page, limit },
      });
      set((state) => ({
        userPosts: {
          ...state.userPosts,
          [userId]: {
            list: response.posts || [],
            totalPages: response.totalPages || 1,
            isLoading: false,
            error: null,
          },
        },
      }));
      console.log(
        `✅ Posts fetched for user ${userId}:`,
        response.posts?.length || 0
      );
    } catch (error) {
      console.error(`❌ Fetch User Posts Error (${userId}):`, error);
      const errorMessage = error.message || "Failed to fetch user posts";
      set((state) => ({
        userPosts: {
          ...state.userPosts,
          [userId]: {
            ...(state.userPosts[userId] || {}),
            isLoading: false,
            error: errorMessage,
          },
        },
      }));
      toast.error(`Failed to load posts for user ${userId}`);
    }
  },

  /**
   * Creates a new post.
   * @param {object} postData - { content, image? }
   */
  createPost: async (postData) => {
    console.log("Attempting to create post:", postData);
    try {
      const newPost = await apiService.post("/posts", postData);
      toast.success("Post created successfully!");
      console.log("✅ Post created:", newPost);
      set((state) => {
        const authorId = newPost.author._id;
        const updatedUserPosts = { ...state.userPosts };
        // Only update user-specific posts if they are already cached
        if (updatedUserPosts[authorId]?.list) {
          updatedUserPosts[authorId] = {
            ...updatedUserPosts[authorId],
            // Prepend to the specific user's post list
            list: [newPost, ...updatedUserPosts[authorId].list],
          };
        } else {
          // If not cached, initialize it for the current user
          // This ensures the post appears immediately on the home page
          if (authorId === state.currentUser?._id) {
            updatedUserPosts[authorId] = {
              list: [newPost],
              isLoading: false,
              error: null,
              totalPages: 1,
            };
          }
        }
        return { userPosts: updatedUserPosts };
      });
      return newPost;
    } catch (error) {
      console.error("❌ Create Post Error:", error);
      toast.error(error.message || "Failed to create post");
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await apiService.delete(`/posts/${postId}`);
      toast.success("Post deleted successfully!");
      // Simple strategy: refetch posts after deletion
      get().fetchPosts(); // Refetch the first page
    } catch (error) {
      console.error("Delete Post Error:", error);
      const errorMessage = error?.message || "Failed to delete post";
      toast.error(errorMessage);
      // Optionally set a specific error state
    }
  },

  reactToPost: async (postId, emoji) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    console.log(`Attempting reaction (${emoji}) on post ${postId}...`);
    try {
      set((state) => {
        const updatedUserPosts = { ...state.userPosts };
        let userIdForPost = null;
        let postUpdated = false;

        // Find the user whose post list contains this post
        for (const userId in updatedUserPosts) {
          const userPostList = updatedUserPosts[userId]?.list;
          if (userPostList) {
            const postIndex = userPostList.findIndex((p) => p._id === postId);
            if (postIndex !== -1) {
              userIdForPost = userId;
              const post = userPostList[postIndex];
              const existingReactionIndex = post.reactions?.findIndex(
                (r) => r.author._id === currentUser._id && r.emoji === emoji
              );
              let newReactions = [...(post.reactions || [])];
              if (existingReactionIndex !== -1) {
                newReactions.splice(existingReactionIndex, 1);
              } else {
                newReactions.push({
                  _id: `temp-${Date.now()}`,
                  author: {
                    _id: currentUser._id,
                    name: currentUser.name,
                    avatarUrl: currentUser.avatarUrl,
                  },
                  emoji: emoji,
                });
              }
              updatedUserPosts[userId].list[postIndex] = {
                ...post,
                reactions: newReactions,
              };
              postUpdated = true;
              break; // Found and updated the post
            }
          }
        }
        // Return state only if an update occurred
        return postUpdated ? { userPosts: updatedUserPosts } : state;
      });
      await apiService.post("/reactions", {
        targetType: "Post",
        targetId: postId,
        emoji,
      });
      console.log(`✅ Reaction (${emoji}) successful for post ${postId}`);
    } catch (error) {
      console.error(`❌ React to Post Error (${postId}):`, error);
      toast.error(error.message || "Failed to react to post");
      // TODO: Revert optimistic update
    }
  },
});
