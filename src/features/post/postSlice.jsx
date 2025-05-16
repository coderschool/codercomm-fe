import apiService from "@/lib/apiService";
import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialState = {
  posts: [],
  isLoading: false,
  error: null,
};

export const usePosts = create(
  devtools((set, get) => ({
    ...initialState,

    // actions
    fetchPosts: async (page = 1, limit = 10) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await apiService.get("/posts", {
          params: { page, limit },
        });

        const { posts } = data;

        set({
          posts: posts || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Fetch Posts Error:", error);
        const errorMessage = error?.message || "Failed to fetch posts";
        set({ isLoading: false, error: errorMessage });
        toast.error("Failed to fetch posts");
      }
    },

    fetchUserPosts: async (userId, page = 1, limit = 10) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await apiService.get(`/posts/user/${userId}`, {
          params: { page, limit },
        });
        const { posts } = data;

        set({
          posts: posts || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error(`❌ Fetch User Posts Error (${userId}):`, error);
        const errorMessage = error.message || "Failed to fetch user posts";
        set({ isLoading: false, error: errorMessage });
        toast.error(`Failed to load posts`);
      }
    },

    createPost: async (postData) => {
      const posts = get().posts;

      set({ isLoading: true, error: null });
      try {
        const { data } = await apiService.post("/posts", postData);
        const { post } = data;

        set({
          posts: [post, ...posts],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("❌ Create Post Error:", error);
        const errorMessage = error?.message || "Failed to create post";
        set({ isLoading: false, error: errorMessage });
        toast.error("Failed to create post");
      }
    },

    deletePost: async (postId) => {
      const posts = get().posts;
      set({ isLoading: true, error: null });
      try {
        const { data } = await apiService.delete(`/posts/${postId}`);
        set({
          posts: posts.filter((post) => post._id !== postId),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("❌ Delete Post Error:", error);
        const errorMessage = error?.message || "Failed to delete post";
        set({ isLoading: false, error: errorMessage });
        toast.error("Failed to delete post");
      }
    },

    reactToPost: async (postId, emoji) => {
      set({ error: null });

      try {
        const { posts } = get();
        const postIndex = posts.findIndex((post) => post._id === postId);

        const { reactions } = posts[postIndex];

        const { data } = await apiService.post("/reactions", {
          targetType: "POST",
          targetId: postId,
          emoji,
        });

        const { reaction } = data;

        const existingReactionIndex = reactions.findIndex(
          (r) => r._id === reaction._id
        );

        if (existingReactionIndex > -1) {
          if (reaction.emoji) {
            reactions[existingReactionIndex] = reaction;
          } else {
            reactions.splice(existingReactionIndex, 1);
          }
        } else {
          reactions.push(reaction);
        }

        posts[postIndex] = {
          ...posts[postIndex],
          reactions: [...reactions],
        };

        set({ posts: [...posts] });
      } catch (error) {
        console.error(`❌ React to Post Error (${postId}):`, error);
        const errorMessage = error?.message || "Failed to react to post";
        set({ error: errorMessage });
        toast.error("Failed to react to post");
      }
    },
  }))
);
