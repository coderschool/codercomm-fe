import { createStore } from "zustand";
import api from "@/lib/api";

const defaultState = {
  user: {},
  isLoading: false,
  error: null,
};

export const userStore = () =>
  createStore((set) => ({
    // state
    ...defaultState,

    // actions
    actions: {
      fetchUser: async (userId) => {
        set({ isLoading: true, error: null });
        const { user, error } = await api.get(`/users/${userId}`);
        set({ isLoading: false });

        if (error) {
          set({ error });
        }

        set({ user });
      },
    },
  }));
