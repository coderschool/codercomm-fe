import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { createContext, useContext, useState } from "react";
import { userStore } from "./userStore";

const UserContext = createContext();

const UserStoreProvider = ({ children }) => {
  const [store] = useState(userStore);

  return <UserContext.Provider value={store}>{children}</UserContext.Provider>;
};

const useUserState = () => {
  const store = useContext(UserContext);
  if (!store) {
    throw new Error("useUserState must be used within a UserProvider");
  }

  const selector = (state) => ({
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
  });

  const memoizedSelector = useShallow(selector);
  const useState = useStore(store, memoizedSelector);
  return useState;
};

const useUserAction = () => {
  const store = useContext(UserContext);
  if (!store) {
    throw new Error("useUserAction must be used within a UserProvider");
  }

  const useAction = useStore(store, (state) => state.actions);
  return useAction;
};

export { useUserState, useUserAction, UserStoreProvider };
