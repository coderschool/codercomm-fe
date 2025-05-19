import apiService from "@/lib/apiService";
import { toast } from "sonner";
import { createStore, useStore } from "zustand";
// import { useShallow } from "zustand/shallow";
import { devtools, persist } from "zustand/middleware";

const initialState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

const authStore = createStore(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // actions
        login: async ({ email, password }) => {
          set({ isLoading: true, error: null });
          try {
            const response = await apiService.post("/auth/login", {
              email,
              password,
            });
            const { user, accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            set({
              currentUser: user,
              isLoading: false,
            });
            toast.success("Login successful");
            return user;
          } catch (error) {
            console.error("Login Error:", error);
            const errorMessage = error?.message || "Login failed";
            set({ isLoading: false, error: errorMessage });
            toast.error(errorMessage);
            throw error;
          }
        },

        logout: () => {
          localStorage.removeItem("accessToken");
          set(initialState);
          toast.success("Logged out successfully");
        },
      }),
      // persist current user info in local storage
      {
        name: "codercomm-current-user",
        partialize: (state) => ({ currentUser: state.currentUser }),
      }
    ),
    { name: "authStore", store: "authStore" }
  )
);

export const useAuth = (selector) => {
  const store = useStore(authStore, selector);
  return store;
};

/*
 * Advanced selector usage with useShallow:
 * This prevents unnecessary re-renders by ensuring the selectors.
 *
 * See: https://github.com/pmndrs/zustand#selecting-multiple-state-slices
 * Docs: https://zustand.docs.pmnd.rs/migrations/migrating-to-v5#requiring-stable-selector-outputs
 */

// export const useAuthStore = () =>
//   useAuth(
//     useShallow((state) => ({
//       currentUser: state.currentUser,
//       isLoading: state.isLoading,
//       error: state.error,
//     }))
//   );
