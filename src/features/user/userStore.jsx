import { createStore, useStore } from "zustand";
import { devtools } from "zustand/middleware";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

const initialState = {
  user: {},
  isLoading: false,
  error: null,
};

const userStore = createStore(
  devtools(
    (set, get) => ({
      ...initialState,

      // actions
      fetchUserProfile: async (userId) => {
        set({ isLoading: true, error: null, user: {} });
        try {
          const { data } = await apiService.get(`/users/${userId}`);
          const { user } = data;
          set({ user, isLoading: false, error: null });
        } catch (error) {
          console.error(`❌ Fetch User Profile Error (${userId}):`, error);
          const errorMessage = error.message || "Failed to fetch profile";
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },
    }),
    {
      name: "userStore",
      store: "userStore",
    }
  )
);

export const useUser = (selector) => {
  return useStore(userStore, selector);
};
