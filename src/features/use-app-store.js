import { create } from "zustand";
import { persist } from "zustand/middleware";

import { friendSlice } from "@/features/friend/friendSlice";

/**
 * Main application state store using Zustand.
 * Manages global client states
 * Uses `persist` middleware for localStorage persistence of auth state.
 */
export const useAppStore = create(
  persist((set, get) => ({
    ...friendSlice(set, get),
  }))
);
