import { useStore } from "zustand";
import { createContext, useContext, useState } from "react";
import { userStore } from "./userStore";

const UserContext = createContext();

const UserStoreProvider = ({ children }) => {
  const [store] = useState(userStore);

  return <UserContext.Provider value={store}>{children}</UserContext.Provider>;
};

const useUser = (selector) => {
  const userStoreContext = useContext(UserContext);

  if (!userStoreContext) {
    throw new Error("useUser must be used within a UserStoreProvider");
  }

  return useStore(userStoreContext, selector);
};

export { useUser, UserStoreProvider };
