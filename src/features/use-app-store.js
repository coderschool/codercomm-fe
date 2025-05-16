import { create } from "zustand";
import { persist } from "zustand/middleware";

import { friendSlice } from "@/features/friend/friendSlice";
import { userSlice } from "@/features/user/userSlice";

/**
 * Main application state store using Zustand.
 * Manages global client states
 * Uses `persist` middleware for localStorage persistence of auth state.
 */
export const useAppStore = create(
  persist((set, get) => ({
    ...friendSlice(set, get),
    ...userSlice(set, get),

    // Example UI State (Kept)
    selectedUser: null, // Example: To view someone else's profile
    setSelectedUser: (user) => set({ selectedUser: user }),
  }))
);
