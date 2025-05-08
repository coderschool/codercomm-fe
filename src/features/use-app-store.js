import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authSlice } from "@/features/auth/authSlice";
import { postSlice } from "@/features/post/postSlice";
import { commentSlice } from "@/features/comment/commentSlice";
import { friendSlice } from "@/features/friend/friendSlice";
import { userSlice } from "@/features/user/userSlice";

/**
 * Main application state store using Zustand.
 * Manages global client state like authentication and potentially UI state.
 * Server state (posts, comments, friends, etc.) is handled by React Query.
 * Uses `persist` middleware for localStorage persistence of auth state.
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      ...authSlice(set, get),
      ...postSlice(set, get),
      ...commentSlice(set, get),
      ...friendSlice(set, get),
      ...userSlice(set, get),

      // Example UI State (Kept)
      selectedUser: null, // Example: To view someone else's profile
      setSelectedUser: (user) => set({ selectedUser: user }),
    }),

    {
      name: "codercomm-auth-storage",
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
