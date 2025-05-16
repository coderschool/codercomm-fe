import apiService from "@/lib/apiService";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { createStore, useStore } from "zustand";
import { devtools } from "zustand/middleware";

const createCommentsStore = (postId) => {
  const initialStates = {
    comments: [],
    isLoading: false,
    error: null,
    postId,
  };

  return createStore(
    devtools((set, get) => ({
      // initial states
      ...initialStates,

      // actions
      fetchComments: async (page = 1, limit = 5) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiService.get(`/posts/${postId}/comments`, {
            params: { page, limit },
          });
          const { comments } = data;
          set({
            comments: comments,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error(`❌ Fetch Comments Error (Post ${postId}):`, error);
          const errorMessage = error?.message || "Failed to fetch comments";
          set({ isLoading: false, error: errorMessage });
          toast.error("Failed to fetch comments");
        }
      },

      createComment: async (commentData) => {
        try {
          const { data } = await apiService.post(`/posts/${postId}/comments`, {
            commentData,
          });
          const { comment } = data;
          set((state) => ({
            comments: [comment, ...state.comments],
            isLoading: false,
            error: null,
          }));
          toast.success("Comment added successfully!");
          return comment;
        } catch (error) {
          console.error(`❌ Create Comment Error (Post ${postId}):`, error);
          const errorMessage = error?.message || "Failed to add comment";
          set({ isLoading: false, error: errorMessage });
        }
      },

      reactToComment: async (commentId, emoji) => {
        set({ error: null });
        try {
          const { comments } = get();
          const commentIndex = comments.findIndex((c) => c._id === commentId);

          const { reactions } = comments[commentIndex];

          const { data } = await apiService.post("/reactions", {
            targetType: "COMMENT",
            targetId: commentId,
            emoji,
          });

          const { reaction } = data;

          const existingReactionIndex = reactions.findIndex(
            (r) => r._id === reaction._id
          );

          if (existingReactionIndex > -1) {
            if (reaction.emoji) {
              comments[commentIndex].reactions[existingReactionIndex] =
                reaction;
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

          set({ comments: [...comments] });
        } catch (error) {
          console.error(`❌ React to Comment Error (Post ${postId}):`, error);
          const errorMessage = error?.message || "Failed to react to comment";
          set({ error: errorMessage });
          toast.error("Failed to react to comment");
        }
      },
    }))
  );
};

const CommentStoreContext = createContext();

export const CommentStore = ({ children, postId }) => {
  const [store] = useState(() => createCommentsStore(postId));

  useEffect(() => {
    store.getState().fetchComments();
  }, [store]);

  return (
    <CommentStoreContext.Provider value={store}>
      {children}
    </CommentStoreContext.Provider>
  );
};

export const useComments = (selector) => {
  const store = useContext(CommentStoreContext);
  return useStore(store, selector);
};
