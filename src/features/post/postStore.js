import { createStore } from "zustand";
import api from "@/lib/api";

const defaultState = {
  posts: [],
  isLoading: false,
  error: null,
  cursorPostId: null,
  hasMore: false,
};

export const postStore = () =>
  createStore((set, get) => ({
    // state
    ...defaultState,

    // actions
    actions: {
      fetchPosts: async (limit = 5) => {
        const currentPosts = get().posts;
        const cursorPostId = get().cursorPostId;

        set({ isLoading: true });

        const { posts, nextCursor, hasMore, error } = await api.get("/posts", {
          params: { cursor: cursorPostId, limit },
        });

        set({ isLoading: false });

        if (error) {
          set({ error: error });
          return;
        }

        set({
          posts: [...currentPosts, ...posts],
          cursorPostId: nextCursor,
          hasMore,
        });
      },

      fetchUserPosts: async (userId, limit = 5) => {
        const currentPosts = get().posts;
        const cursorPostId = get().cursorPostId;

        set({ isLoading: true });

        const { posts, nextCursor, hasMore, error } = await api.get(
          `/posts/user/${userId}`,
          {
            params: { cursor: cursorPostId, limit },
          }
        );

        set({ isLoading: false });

        if (error) {
          set({ error: error });
          return;
        }

        set({
          posts: [...currentPosts, ...posts],
          cursorPostId: nextCursor,
          hasMore,
        });
      },

      createPost: async ({ content, image }) => {
        const posts = get().posts;

        set({ isLoading: true, error: null });

        const { post, error } = await api.post("/posts", {
          content,
          image,
        });

        set({ isLoading: false });

        if (error) {
          set({ error: error });
          return;
        }

        set({
          posts: [post, ...posts],
        });
      },

      deletePost: async (postId) => {
        const posts = get().posts;

        set({ isLoading: true, error: null });

        const { error } = await api.delete(`/posts/${postId}`);

        set({ isLoading: false });

        if (error) {
          set({ error: error });
          return;
        }

        set({
          posts: posts.filter((post) => post._id !== postId),
        });
      },

      reactToPost: async (postId, emoji) => {
        const posts = get().posts;

        const postIndex = posts.findIndex((post) => post._id === postId);

        const { reactions } = posts[postIndex];

        set({ error: null });
        const { reaction, error } = await api.post("/reactions", {
          targetType: "POST",
          targetId: postId,
          emoji,
        });

        if (error) {
          set({ error });
          return;
        }

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

        set({
          posts: [...posts],
        });
      },
      addPostCommentCount: async (postId) => {
        const posts = get().posts;

        const postIndex = posts.findIndex((post) => post._id === postId);
        const { commentCount } = posts[postIndex];
        const newCommentCount = commentCount + 1;
        posts[postIndex] = {
          ...posts[postIndex],
          commentCount: newCommentCount,
        };

        set({
          posts: [...posts],
        });
      },
    },
  }));
