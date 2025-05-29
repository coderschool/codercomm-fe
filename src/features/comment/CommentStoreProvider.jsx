import { createContext, useContext, useState } from "react";

import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { commentStore } from "./commentStore";

const CommentStoreContext = createContext();

// Provider for individual comment store
const CommentStoreProvider = ({ children, postId }) => {
  const [store] = useState(commentStore(postId));

  return (
    <CommentStoreContext.Provider value={store}>
      {children}
    </CommentStoreContext.Provider>
  );
};

const useCommentState = () => {
  const store = useContext(CommentStoreContext);
  if (!store) {
    throw new Error("useComments must be used within a CommentStoreProvider");
  }

  const selector = (state) => ({
    comments: state.comments,
    isLoading: state.isLoading,
    error: state.error,
    cursorCommentId: state.cursorCommentId,
    hasMore: state.hasMore,
    isInitialized: state.isInitialized,
    postId: state.postId,
  });

  const memoizedSelector = useShallow(selector);
  const useState = useStore(store, memoizedSelector);
  return useState;
};

const useCommentAction = () => {
  const store = useContext(CommentStoreContext);
  if (!store) {
    throw new Error(
      "useCommentsAction must be used within a CommentStoreProvider"
    );
  }
  return useStore(store, (state) => state.actions);
};

export { useCommentState, useCommentAction, CommentStoreProvider };
