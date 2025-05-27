import { createContext, useContext, useState } from "react";

import { useStore } from "zustand";

import { useShallow } from "zustand/shallow";
import { postStore } from "./postStore";

const PostStoreContext = createContext();

// Provider for individual post store
const PostStoreProvider = ({ children }) => {
  const [store] = useState(postStore);

  return (
    <PostStoreContext.Provider value={store}>
      {children}
    </PostStoreContext.Provider>
  );
};

const usePostState = () => {
  const store = useContext(PostStoreContext);
  if (!store) {
    throw new Error("usePostState must be used within a PostStoreProvider");
  }

  const selector = (state) => ({
    posts: state.posts,
    isLoading: state.isLoading,
    error: state.error,
    cursorPostId: state.cursorPostId,
    hasMore: state.hasMore,
  });

  const memoizedSelector = useShallow(selector);
  const useState = useStore(store, memoizedSelector);
  return useState;
};

const usePostAction = () => {
  const store = useContext(PostStoreContext);
  if (!store) {
    throw new Error("usePostAction must be used within a PostStoreProvider");
  }
  const useAction = useStore(store, (state) => state.actions);
  return useAction;
};

export { usePostState, usePostAction, PostStoreProvider };
