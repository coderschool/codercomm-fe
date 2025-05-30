import { useStore } from "zustand";
import { authStore } from "./authStore";

const useAuth = (selector) => {
  return useStore(authStore, selector);
};

export { useAuth };
