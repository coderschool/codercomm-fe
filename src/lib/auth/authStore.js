import api from "@/lib/api";
import { toast } from "sonner";
import { createStore } from "zustand";

const defaultState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

export const authStore = createStore((set, get) => ({
  // state
  ...defaultState,
  isInitialized: false,

  // actions
  actions: {
    setCurrentUser: (user) => {
      set({ currentUser: user });
    },

    // Initialize the auth store
    // Since we only persist the access token
    // we need to re-fetch the current user on page refresh
    init: async () => {
      const { user, error } = await api.get("/users/me");
      set({ ...defaultState, isInitialized: true });

      if (error) {
        return;
      }

      set({ currentUser: user });
    },

    login: async ({ email, password }) => {
      set({ ...defaultState, isLoading: true });
      const { user, error } = await api.post("/auth/login", {
        email,
        password,
      });
      set({ isLoading: false });

      if (error) {
        set({ error: error });
        toast.error(error);
        return;
      }

      set({ currentUser: user });
    },

    register: async ({ name, email, password }) => {
      set({ ...defaultState, isLoading: true });
      const { user, error } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      set({ isLoading: false });

      if (error) {
        set({ error: error });
        toast.error(error);
        return;
      }

      set({ currentUser: user });
    },

    logout: async () => {
      set({ ...defaultState, isLoading: true });
      const { error } = await api.post("/auth/logout");
      set({ isLoading: false, currentUser: null });

      if (error) {
        set({ error: error });
        toast.error(error);
      }
    },
  },
}));
