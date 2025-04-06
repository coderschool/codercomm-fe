import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/apiService"; // Our Axios instance
import { toast } from "sonner"; // For notifications

// --- Custom Hook: useUserQuery ---
/**
 * Fetches a single user's profile data by their ID.
 * Uses React Query's `useQuery` for data fetching and caching.
 * @param {string | undefined} userId - ID of the user to fetch. The query is disabled if userId is falsy.
 * @returns {QueryResult} The result object from `useQuery`, containing user data, loading state, error state, etc.
 */
export function useUserQuery(userId) {
  return useQuery({
    // queryKey: Unique identifier for this query. 
    // React Query uses this for caching. Includes the user ID so different profiles have different cache entries.
    queryKey: ["users", userId], 
    
    // queryFn: The asynchronous function that performs the data fetching.
    queryFn: async () => {
      console.log(`Fetching user: ${userId}`); // Debug log
      // Use our apiService to make the GET request.
      // Assuming apiService interceptor returns response.data directly on success.
      const response = await apiService.get(`/users/${userId}`);
      return response.data; // Return the user data
    },
    
    // enabled: Controls if the query should automatically run.
    // We only run the query if a valid `userId` is provided. `!!userId` converts userId to a boolean.
    enabled: !!userId, 

    // staleTime: How long data is considered fresh (won't refetch on mount/focus). Default is 0.
    // staleTime: 5 * 60 * 1000, // Example: 5 minutes (can be set globally too)

    // cacheTime: How long inactive query data remains in cache. Default is 5 minutes.
    // cacheTime: 10 * 60 * 1000, // Example: 10 minutes
  });
}

// --- Custom Hook: useUpdateProfile ---
/**
 * Provides a mutation function to update the current user's profile.
 * Uses React Query's `useMutation` for handling the update operation.
 * @returns {MutationResult} The result object from `useMutation`, containing mutation function, status, etc.
 */
export function useUpdateProfile() {
  // Get the QueryClient instance - needed to invalidate/update cache after mutation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: The asynchronous function that performs the update.
    // It receives an object, typically containing the data needed for the update.
    mutationFn: async ({ userId, ...updateData }) => { 
      console.log(`Updating profile for user: ${userId}`, updateData); // Debug log
      // Use apiService to make the PUT request.
      // Our mock API is hardcoded to update '/users/me', but a real API would use userId.
      // We'll assume the API call targets the correct user based on authentication or userId.
      const response = await apiService.put(`/users/me`, updateData); // Mock uses /me
      // const response = await apiService.put(`/users/${userId}`, updateData); // Real API might use this
      return response.data; // Return the updated user data from the response
    },
    
    // onSuccess: Callback function executed after a successful mutation.
    // Receives the data returned by `mutationFn` and the variables passed to `mutate`.
    onSuccess: (updatedUser, variables) => {
      console.log("Profile update successful:", updatedUser);
      
      // --- Cache Invalidation/Update Strategy ---
      // It's crucial to update the cache after a mutation so the UI reflects changes.
      
      // Option 1: Invalidate queries related to the updated user.
      // This tells React Query that the data for these keys is stale and needs refetching.
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
      // Also invalidate the current user query if applicable
      // Note: If updating 'me', we might directly update the Zustand store as well, 
      // but invalidation handles the React Query cache.
      queryClient.invalidateQueries({ queryKey: ["users", "me"] }); 
      
      // Option 2 (More optimistic): Directly update the cache with the new data.
      // This can feel faster as the UI updates immediately without waiting for a refetch.
      // queryClient.setQueryData(["users", variables.userId], updatedUser);
      // queryClient.setQueryData(["users", "me"], updatedUser); // Update 'me' query too

      // For this tutorial, invalidation is simpler to demonstrate.
      
      toast.success("Profile updated successfully");
    },
    
    // onError: Callback function executed if the mutation fails.
    onError: (error) => {
      console.error("Profile update failed:", error);
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// --- Custom Hook: useUserPosts ---
/**
 * Fetches posts created by a specific user.
 * @param {string | undefined} userId - ID of the user whose posts to fetch. Query disabled if falsy.
 * @returns {QueryResult} Result object from `useQuery` for the user's posts.
 */
export function useUserPosts(userId) {
  return useQuery({
    // Query key includes user ID to cache posts per user.
    queryKey: ["posts", "user", userId], 
    queryFn: async () => {
      console.log(`Fetching posts for user: ${userId}`); // Debug log
      const response = await apiService.get(`/posts/user/${userId}`);
      // Assuming the API returns an object like { posts: [], count: X, totalPages: Y }
      return response.data; 
    },
    enabled: !!userId, // Only fetch if userId is provided
  });
} 