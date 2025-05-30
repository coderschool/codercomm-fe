import { createContext, useContext, useState } from "react";

import { useStore } from "zustand";

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

const usePost = (selector) => {
  const postStoreContext = useContext(PostStoreContext);
  if (!postStoreContext) {
    throw new Error("usePost must be used within a PostStoreProvider");
  }

  return useStore(postStoreContext, selector);
};

export { usePost, PostStoreProvider };
