import apiService from "@/lib/apiService";
import { toast } from "sonner";

export const userSlice = (set, get) => ({
  // Users State
  users: { list: [], isLoading: false, error: null, totalPages: 1 },

  // User Profile State
  // Store profiles by userId to avoid re-fetching
  userProfiles: {},
  // Example: { userId1: { data: {...}, isLoading: false, error: null }, userId2: ... }

  // User Actions

  /**
   * Fetches a user's profile by ID, storing it in the userProfiles state.
   * @param {string} userId
   */
  fetchUserProfile: async (userId) => {
    // Check if profile is already fetched or loading to prevent redundant calls
    const existingProfileState = get().userProfiles[userId];
    if (existingProfileState?.data || existingProfileState?.isLoading) {
      // console.log(`Profile for ${userId} already fetched or loading.`);
      return; // Avoid refetching if data exists or is loading
    }

    set((state) => ({
      userProfiles: {
        ...state.userProfiles,
        [userId]: {
          ...(state.userProfiles[userId] || {}),
          isLoading: true,
          error: null,
        },
      },
    }));
    console.log(`Attempting fetch profile for ${userId}...`);
    try {
      const response = await apiService.get(`/users/${userId}`);
      set((state) => ({
        userProfiles: {
          ...state.userProfiles,
          [userId]: { data: response.user, isLoading: false, error: null },
        },
      }));
      console.log(`✅ Profile fetched for ${userId}`);
      return response.user;
    } catch (error) {
      console.error(`❌ Fetch User Profile Error (${userId}):`, error);
      const errorMessage = error.message || "Failed to fetch profile";
      set((state) => ({
        userProfiles: {
          ...state.userProfiles,
          [userId]: {
            ...(state.userProfiles[userId] || {}),
            isLoading: false,
            error: errorMessage,
          },
        },
      }));
      toast.error(`Failed to load profile for user ${userId}`);
      // Don't throw error here, let component handle display based on state
    }
  },

  /**
   * Updates the current user's profile.
   * @param {object} updatedData - Fields to update.
   */
  updateUserProfile: async (updatedData) => {
    // No specific loading state needed, form handles it
    console.log("Attempting update profile:", updatedData);
    try {
      const response = await apiService.put("/users/me", updatedData);
      const updatedUser = response.user;
      // Update currentUser state
      set({ currentUser: updatedUser });
      toast.success("Profile updated successfully!");
      console.log("✅ Profile updated:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("❌ Update Profile Error:", error);
      const errorMessage = error.message || "Failed to update profile";
      toast.error(errorMessage);
      throw error; // Re-throw for form error handling
    }
  },
});
