import { createContext, useContext, useState } from "react";

import { useStore } from "zustand";
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

const useComment = (selector) => {
  const commentStoreContext = useContext(CommentStoreContext);

  if (!commentStoreContext) {
    throw new Error("useComment must be used within a CommentStoreProvider");
  }

  return useStore(commentStoreContext, selector);
};

export { useComment, CommentStoreProvider };
