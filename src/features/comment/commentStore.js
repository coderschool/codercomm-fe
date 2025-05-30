import { createStore } from "zustand";
import api from "@/lib/api";

const defaultState = {
  comments: [],
  isLoading: false,
  error: null,
  cursorCommentId: null,
  hasMore: false,
  postId: null,
};

export const commentStore = (postId) =>
  createStore((set, get) => ({
    // initial states
    ...defaultState,
    isInitialized: false,
    postId,

    // actions
    actions: {
      fetchComments: async (cursorCommentId = null, limit = 5) => {
        const { comments } = get();
        set({ isLoading: true, isInitialized: true });

        const {
          comments: newComments,
          nextCursor,
          hasMore,
          error,
        } = await api.get(`/posts/${postId}/comments`, {
          params: { cursor: cursorCommentId, limit },
        });

        set({ isLoading: false });

        if (error) {
          set({ error });
        }

        set({
          comments: [...comments, ...newComments],
          cursorCommentId: nextCursor,
          hasMore,
        });
      },

      createComment: async (content) => {
        const { comments } = get();
        set({ isLoading: true, isInitialized: true });
        const { comment, error } = await api.post(`/posts/${postId}/comments`, {
          content,
        });

        set({ isLoading: false });

        if (error) {
          set({ error });
        }

        set({
          comments: [comment, ...comments],
        });
      },

      reactToComment: async (commentId, emoji) => {
        set({ error: null });

        const { comments } = get();

        const commentIndex = comments.findIndex((c) => c._id === commentId);

        const { reactions } = comments[commentIndex];

        const { reaction, error } = await api.post("/reactions", {
          targetType: "COMMENT",
          targetId: commentId,
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
            comments[commentIndex].reactions[existingReactionIndex] = reaction;
          } else {
            comments[commentIndex].reactions.splice(existingReactionIndex, 1);
          }
        } else {
          comments[commentIndex].reactions.push(reaction);
        }

        comments[commentIndex] = {
          ...comments[commentIndex],
          reactions: [...reactions],
        };

        set({
          comments: [...comments],
        });
      },
    },
  }));
