import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { authStore } from "./authStore";

const useAuthState = () => {
  const selector = (state) => ({
    currentUser: state.currentUser,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
  });

  /*
   * Advanced selector usage with useShallow:
   * This prevents unnecessary re-renders by ensuring the selectors (Meaning one state change will not trigger a re-render)
   *
   * See: https://github.com/pmndrs/zustand#selecting-multiple-state-slices
   * Docs: https://zustand.docs.pmnd.rs/migrations/migrating-to-v5#requiring-stable-selector-outputs
   */
  const memoizedSelector = useShallow(selector);

  const store = useStore(authStore, memoizedSelector);
  return store;
};

const useAuthAction = () => {
  const store = useStore(authStore, (state) => state.actions);
  return store;
};

export { useAuthState, useAuthAction };
