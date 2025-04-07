import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import apiService from './apiService';
import { isValidToken } from '../utils/jwt';

/**
 * Helper function: Set or remove the authentication token in localStorage
 * and update the default Authorization header for apiService.
 * @param {string | null} accessToken - The JWT token or null to clear.
 */
const setSession = (accessToken) => {
  if (accessToken) {
    // Store token in browser's local storage for persistence
    localStorage.setItem('accessToken', accessToken);
    // Set the token as the default Authorization header for all API requests
    // Need to handle potential initial call before apiService is fully initialized
    if (apiService?.defaults?.headers?.common) {
      apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn("apiService not ready when setting initial session header");
    }
  } else {
    // Remove token from local storage
    localStorage.removeItem('accessToken');
    // Remove the Authorization header from future API requests
    if (apiService?.defaults?.headers?.common) {
      delete apiService.defaults.headers.common.Authorization;
    }
  }
};

/**
 * Main application state store using Zustand.
 * Manages global client state like authentication and potentially UI state.
 * Server state (posts, comments, friends, etc.) is handled by React Query.
 * Uses `persist` middleware for localStorage persistence of auth state.
 */
const useStore = create(
  persist(
    (set, get) => ({
      // --- Client State Properties ---

      // Authentication State
      currentUser: null,        // Holds the logged-in user object (null if not logged in)
      isLoadingAuth: false,     // Loading state specifically for auth operations
      authError: null,          // Errors specifically from auth operations

      // Example UI State (Kept)
      selectedUser: null, // Example: To view someone else's profile

      // --- Server State Properties (Managed via Zustand Actions) ---

      // Posts State
      posts: [],
      isLoadingPosts: false,
      postsError: null,
      totalPostPages: 1, // Assuming pagination might be needed later

      // Comments State
      comments: {}, // Structure: { postId: { list: [], isLoading: false, error: null, totalPages: 1 } }
      // Note: Global loading/error states might be less useful for comments fetched per-post
      // We'll manage loading/error within the comments[postId] object.

      // Friends State
      friends: { list: [], isLoading: false, error: null, totalPages: 1 },
      friendRequests: { incoming: [], outgoing: [], isLoading: false, error: null },

      // Users State (Primarily for friend search)
      users: { list: [], isLoading: false, error: null, totalPages: 1 },
      
      // --- Actions (Functions to modify state) ---

      // Auth Actions
      initializeAuth: async () => {
        // This action runs when the app starts
        set({ isLoadingAuth: true, authError: null });
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken && isValidToken(accessToken)) {
            setSession(accessToken);
            const user = await apiService.get('/users/me');
            set({
              currentUser: user,
              isLoadingAuth: false,
            });
            console.log("Auth Initialized: User Logged In", user);
            return true;
          } else {
            setSession(null);
            set({
              currentUser: null,
              isLoadingAuth: false,
            });
            console.log("Auth Initialized: No User Logged In");
            return false;
          }
        } catch (error) {
          console.error("Auth Initialization Error:", error);
          setSession(null);
          set({
            currentUser: null,
            isLoadingAuth: false,
            authError: error.message || 'Failed to initialize authentication',
          });
          return false;
        }
      },

      login: async (credentials) => {
        set({ isLoadingAuth: true, authError: null });
        try {
          const response = await apiService.post('/auth/login', credentials);
          const { user, accessToken } = response;
          setSession(accessToken);
          set({
            currentUser: user,
            isLoadingAuth: false,
          });
          toast.success('Login successful');
          return user;
        } catch (error) {
          console.error("Login Error:", error);
          const errorMessage = error?.message || 'Login failed';
          set({ isLoadingAuth: false, authError: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: () => {
        setSession(null);
        set({ currentUser: null, authError: null });
        toast.success('Logged out successfully');
      },

      // --- UI State Actions (Example) ---
      setSelectedUser: (user) => set({ selectedUser: user }),

      // --- Post Actions ---

      fetchPosts: async (page = 1, limit = 10) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          // Assuming your API endpoint for fetching posts is /posts
          // Adjust query params as needed (e.g., for pagination)
          const response = await apiService.get('/posts', {
            params: { page, limit },
          });
          // Assuming the API returns data like { posts: [...], totalPages: X }
          set({
            posts: response.posts || [],
            totalPostPages: response.totalPages || 1,
            isLoadingPosts: false,
          });
        } catch (error) {
          console.error("Fetch Posts Error:", error);
          const errorMessage = error?.message || 'Failed to fetch posts';
          set({ isLoadingPosts: false, postsError: errorMessage });
          toast.error(errorMessage);
        }
      },

      createPost: async (postData) => {
        // Note: No loading state specific to *creating* a single post here yet
        // Could add one if needed for better UI feedback
        try {
          const newPost = await apiService.post('/posts', postData);
          toast.success('Post created successfully!');
          // Simple strategy: refetch posts after creation
          get().fetchPosts(); // Refetch the first page
          return newPost;
        } catch (error) {
          console.error("Create Post Error:", error);
          const errorMessage = error?.message || 'Failed to create post';
          toast.error(errorMessage);
          // Optionally set a specific error state for creation
          // set({ createPostError: errorMessage });
          throw error; // Re-throw for form handling if needed
        }
      },

      deletePost: async (postId) => {
        try {
          await apiService.delete(`/posts/${postId}`);
          toast.success('Post deleted successfully!');
          // Simple strategy: refetch posts after deletion
          get().fetchPosts(); // Refetch the first page
        } catch (error) {
          console.error("Delete Post Error:", error);
          const errorMessage = error?.message || 'Failed to delete post';
          toast.error(errorMessage);
          // Optionally set a specific error state
        }
      },

      reactToPost: async (postId, reactionType) => {
        try {
          // Assuming endpoint like /posts/:id/react
          await apiService.post(`/posts/${postId}/react`, { reactionType });
          // Toast might be too noisy here, maybe just update UI
          // Simple strategy: refetch posts after reaction
          get().fetchPosts(); // Refetch the first page
        } catch (error) {
          console.error("React to Post Error:", error);
          const errorMessage = error?.message || 'Failed to react to post';
          toast.error(errorMessage);
          // Optionally set a specific error state
        }
      },

      // --- Comment Actions ---

      fetchComments: async (postId, page = 1, limit = 5) => {
        // Set loading state specifically for this post's comments
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: { ...state.comments[postId], isLoading: true, error: null },
          },
        }));
        try {
          const response = await apiService.get(`/posts/${postId}/comments`, {
            params: { page, limit },
          });
          // Assuming API returns { comments: [...], totalPages: X }
          set((state) => ({
            comments: {
              ...state.comments,
              [postId]: {
                list: response.comments || [],
                totalPages: response.totalPages || 1,
                isLoading: false,
                error: null,
              },
            },
          }));
        } catch (error) {
          console.error(`Fetch Comments Error (Post ${postId}):`, error);
          const errorMessage = error?.message || 'Failed to fetch comments';
          set((state) => ({
            comments: {
              ...state.comments,
              [postId]: { ...state.comments[postId], isLoading: false, error: errorMessage },
            },
          }));
          toast.error(errorMessage);
        }
      },

      createComment: async (postId, commentData) => {
        // Get currentUser from state immediately to use in optimistic update
        const currentUser = get().currentUser;
        if (!currentUser) {
          toast.error("You must be logged in to comment.");
          throw new Error("User not logged in");
        }

        try {
          // Make the API call
          const newComment = await apiService.post(`/posts/${postId}/comments`, commentData);
          toast.success('Comment added successfully!');

          // Update state directly instead of refetching
          set((state) => {
            const postComments = state.comments[postId] || { list: [], isLoading: false, error: null, totalPages: 1 };
            return {
              comments: {
                ...state.comments,
                [postId]: {
                  ...postComments,
                  // Prepend the new comment returned by the API
                  list: [newComment, ...(postComments.list || [])],
                },
              },
            };
          });

          // Also update the post's comment count in the main posts list
          set(state => {
            const postIndex = state.posts.findIndex(p => p._id === postId);
            if (postIndex !== -1) {
              const updatedPosts = [...state.posts];
              updatedPosts[postIndex] = {
                ...updatedPosts[postIndex],
                // Ensure commentCount exists before incrementing
                commentCount: (updatedPosts[postIndex].commentCount || 0) + 1
              };
              return { posts: updatedPosts };
            }
            return {}; // No change if post not found in the list
          });

          return newComment; // Return the new comment object

        } catch (error) {
          console.error(`Create Comment Error (Post ${postId}):`, error);
          const errorMessage = error?.message || 'Failed to add comment';
          toast.error(errorMessage);
          // Re-throw error for the form to potentially handle (e.g., keep submitting state)
          throw error;
        }
      },

      deleteComment: async (commentId) => {
        // We need the postId to refetch, but the API endpoint only needs commentId.
        // This implies components calling deleteComment need to know the postId,
        // or we find the postId from the store (less ideal).
        // Let's assume the component provides postId for now.
        // Alternative: Store could potentially find the post containing the comment.
        try {
          await apiService.delete(`/comments/${commentId}`);
          toast.success('Comment deleted successfully!');
          // Problem: How to refetch? We need the postId.
          // Solution 1: Pass postId to deleteComment
          // Solution 2: Modify state locally (optimistic update or remove from list)
          // Solution 3: Refetch *all* posts (inefficient)
          // Let's go with Solution 2 for simplicity: remove locally
          set((state) => {
            const updatedComments = { ...state.comments };
            let postIdToUpdate = null;
            // Find which post had this comment
            for (const postId in updatedComments) {
              if (updatedComments[postId]?.list?.some(c => c._id === commentId)) {
                postIdToUpdate = postId;
                updatedComments[postId] = {
                  ...updatedComments[postId],
                  list: updatedComments[postId].list.filter(c => c._id !== commentId),
                };
                break;
              }
            }
            // Also refetch posts to update commentCount on the post itself
            if (postIdToUpdate) {
              get().fetchPosts(); // Inefficient, but ensures comment count updates
            }
            return { comments: updatedComments };
          });

        } catch (error) {
          console.error(`Delete Comment Error (Comment ${commentId}):`, error);
          const errorMessage = error?.message || 'Failed to delete comment';
          toast.error(errorMessage);
        }
      },

      reactToComment: async (commentId, reactionType) => {
        // Similar problem to delete: need postId for efficient refetch/update.
        try {
          await apiService.post(`/comments/${commentId}/react`, { reactionType });
          // Solution: Refetch the specific comment list or update locally
          // Let's update locally for now to avoid needing postId explicitly passed.
          set((state) => {
            const updatedComments = { ...state.comments };
            let postIdToUpdate = null;
            let userId = state.currentUser?._id;
            if (!userId) return state; // Need user to update reaction state

            for (const postId in updatedComments) {
              const commentIndex = updatedComments[postId]?.list?.findIndex(c => c._id === commentId);
              if (commentIndex !== -1) {
                postIdToUpdate = postId;
                const comment = updatedComments[postId].list[commentIndex];
                const existingReactionIndex = comment.reactions?.findIndex(r => r.author._id === userId && r.emoji === reactionType);

                let newReactions = [...(comment.reactions || [])];
                if (existingReactionIndex !== -1) {
                  // User already reacted with this type, remove reaction (toggle off)
                  newReactions.splice(existingReactionIndex, 1);
                } else {
                  // Add new reaction (assuming API handles backend logic)
                  // We don't have the full reaction object back, so make a placeholder
                  newReactions.push({ author: { _id: userId }, emoji: reactionType });
                  // Note: This is a simplification. A real app might need author details.
                }

                updatedComments[postId].list[commentIndex] = {
                  ...comment,
                  reactions: newReactions,
                };
                break;
              }
            }
            return { comments: updatedComments };
          });
        } catch (error) {
          console.error(`React to Comment Error (Comment ${commentId}):`, error);
          const errorMessage = error?.message || 'Failed to react to comment';
          toast.error(errorMessage);
        }
      },

      // --- Friend Actions ---

      fetchFriends: async (page = 1, limit = 10, query = "") => {
        set((state) => ({ friends: { ...state.friends, isLoading: true, error: null } }));
        try {
          const response = await apiService.get("/friends", { params: { page, limit, query } });
          set((state) => ({
            friends: {
              list: response.users || [],
              totalPages: response.totalPages || 1,
              isLoading: false,
              error: null,
            },
          }));
        } catch (error) {
          console.error("Fetch Friends Error:", error);
          const errorMessage = error?.message || 'Failed to fetch friends';
          set((state) => ({ friends: { ...state.friends, isLoading: false, error: errorMessage } }));
          toast.error(errorMessage);
        }
      },

      fetchFriendRequests: async () => {
        set((state) => ({ friendRequests: { ...state.friendRequests, isLoading: true, error: null } }));
        try {
          // Assume endpoint returns { incoming: [...], outgoing: [...] }
          const response = await apiService.get('/friends/requests');
          set((state) => ({
            friendRequests: {
              incoming: response.incoming || [],
              outgoing: response.outgoing || [],
              isLoading: false,
              error: null,
            },
          }));
        } catch (error) {
          console.error("Fetch Friend Requests Error:", error);
          const errorMessage = error?.message || 'Failed to fetch friend requests';
          set((state) => ({ friendRequests: { ...state.friendRequests, isLoading: false, error: errorMessage } }));
          toast.error(errorMessage);
        }
      },
      
      fetchUsers: async (query = '', page = 1, limit = 10) => {
        set((state) => ({ users: { ...state.users, isLoading: true, error: null } }));
        try {
          // Assuming endpoint /users for searching non-friends
          const response = await apiService.get('/users', { params: { query, page, limit } });
          set((state) => ({
            users: {
              list: response.users || [],
              totalPages: response.totalPages || 1,
              isLoading: false,
              error: null,
            },
          }));
        } catch (error) {
          console.error("Fetch Users Error:", error);
          const errorMessage = error?.message || 'Failed to search users';
          set((state) => ({ users: { ...state.users, isLoading: false, error: errorMessage } }));
          toast.error(errorMessage);
        }
      },

      sendFriendRequest: async (userId) => {
        try {
          await apiService.post('/friends/requests', { userId });
          toast.success('Friend request sent!');
          // Refetch outgoing requests to update UI
          get().fetchFriendRequests();
          // Refetch users search results if applicable (user might disappear from search)
          // get().fetchUsers(get().users?.lastQuery); // Need to store last query
        } catch (error) {
          console.error("Send Friend Request Error:", error);
          const errorMessage = error?.message || 'Failed to send request';
          toast.error(errorMessage);
        }
      },

      acceptFriendRequest: (requestId) => {
        // Mock action: Directly modify state
        set((state) => {
          const updatedIncoming = state.friendRequests.incoming.filter(
            (req) => req._id !== requestId
          );
          // Optional: Add to friends list locally if needed for mock
          // const acceptedFriend = state.friendRequests.incoming.find(req => req._id === requestId)?.sender;
          // const updatedFriendsList = acceptedFriend ? [...state.friends.list, acceptedFriend] : state.friends.list;
          
          toast.success('Friend request accepted! (Mock)');
          return {
            friendRequests: {
              ...state.friendRequests,
              incoming: updatedIncoming,
            },
            // friends: { ...state.friends, list: updatedFriendsList } // Uncomment if adding locally
          };
        });
        // try {
        //   await apiService.put(`/friends/requests/${requestId}/accept`);
        //   toast.success('Friend request accepted!');
        //   // Refetch requests (request disappears)
        //   get().fetchFriendRequests();
        //   // Refetch friends list (new friend appears)
        //   get().fetchFriends();
        // } catch (error) {
        //   console.error("Accept Friend Request Error:", error);
        //   const errorMessage = error?.message || 'Failed to accept request';
        //   toast.error(errorMessage);
        // }
      },

      rejectFriendRequest: async (requestId) => {
        // Mock action: Directly modify state (Assuming reject just removes the request)
        set((state) => {
          const updatedIncoming = state.friendRequests.incoming.filter(
            (req) => req._id !== requestId
          );
          toast.success('Friend request rejected. (Mock)');
          return {
            friendRequests: {
              ...state.friendRequests,
              incoming: updatedIncoming,
            },
          };
        });
        // try {
        //   await apiService.put(`/friends/requests/${requestId}/reject`);
        //   toast.success('Friend request rejected.');
        //   // Refetch requests (request disappears)
        //   get().fetchFriendRequests();
        // } catch (error) {
        //   console.error("Reject Friend Request Error:", error);
        //   const errorMessage = error?.message || 'Failed to reject request';
        //   toast.error(errorMessage);
        // }
      },

      cancelFriendRequest: (requestId) => {
        // Mock action: Directly modify state
        set((state) => {
          const updatedOutgoing = state.friendRequests.outgoing.filter(
            (req) => req._id !== requestId
          );
          toast.success('Friend request cancelled. (Mock)');
          return {
            friendRequests: {
              ...state.friendRequests,
              outgoing: updatedOutgoing,
            },
          };
        });
        // try {
        //   // Assuming DELETE /friends/requests/:requestId for cancelling outgoing
        //   await apiService.delete(`/friends/requests/${requestId}`);
        //   toast.success('Friend request cancelled.');
        //   // Refetch requests (request disappears)
        //   get().fetchFriendRequests();
        // } catch (error) {
        //   console.error("Cancel Friend Request Error:", error);
        //   const errorMessage = error?.message || 'Failed to cancel request';
        //   toast.error(errorMessage);
        // }
      },

      removeFriend: async (friendshipId) => { // Or maybe use friend's userId?
        try {
          // Assuming endpoint DELETE /friends/:id where id is friendship or friend's user id
          await apiService.delete(`/friends/${friendshipId}`); 
          toast.success('Friend removed.');
          // Refetch friends list
          get().fetchFriends();
          // Potentially refetch user search/profiles if needed
        } catch (error) {
          console.error("Remove Friend Error:", error);
          const errorMessage = error?.message || 'Failed to remove friend';
          toast.error(errorMessage);
        }
      },

      // --- User Actions ---

      fetchUserProfile: async (userId) => {
        // Set loading state for this specific profile
        set((state) => ({
          userProfiles: {
            ...state.userProfiles,
            [userId]: { ...state.userProfiles[userId], isLoading: true, error: null },
          },
        }));
        try {
          const profileData = await apiService.get(`/users/${userId}`);
          set((state) => ({
            userProfiles: {
              ...state.userProfiles,
              [userId]: { data: profileData, isLoading: false, error: null },
            },
          }));
          return profileData;
        } catch (error) {
          console.error(`Fetch User Profile Error (User ${userId}):`, error);
          const errorMessage = error?.message || 'Failed to fetch profile';
          set((state) => ({
            userProfiles: {
              ...state.userProfiles,
              [userId]: { ...state.userProfiles[userId], isLoading: false, error: errorMessage },
            },
          }));
          toast.error(errorMessage);
          // Don't throw error here, let component handle display based on state
        }
      },

    
      fetchUserPosts: async (userId, page = 1, limit = 10) => {
        // Set loading state specifically for this user's posts
        set((state) => ({
          userPosts: {
            ...state.userPosts,
            [userId]: { ...(state.userPosts[userId] || {}), isLoading: true, error: null },
          },
        }));
        try {
          // Assuming endpoint like /users/:userId/posts
          const response = await apiService.get(`/users/${userId}/posts`, {
            params: { page, limit },
          });
          // Assuming API returns { posts: [...], totalPages: X }
          set((state) => ({
            userPosts: {
              ...state.userPosts,
              [userId]: {
                list: response.posts || [],
                totalPages: response.totalPages || 1,
                isLoading: false,
                error: null,
              },
            },
          }));
        } catch (error) {
          console.error(`Fetch User Posts Error (User ${userId}):`, error);
          const errorMessage = error?.message || 'Failed to fetch user posts';
          set((state) => ({
            userPosts: {
              ...state.userPosts,
              [userId]: { ...(state.userPosts[userId] || {}), isLoading: false, error: errorMessage },
            },
          }));
          toast.error(errorMessage);
        }
      },

      // --- OLD Server State Actions (REMOVED) ---
      // setPosts: (posts, totalPages) => set({ posts: posts, totalPostPages: totalPages }),
      // setComments: (postId, comments, totalComments) => set({ ... }),
      // setFriends: (friends, totalPages) => set({ friends: friends, totalFriendPages: totalPages }),
      // setFriendRequests: (incoming, outgoing) => set({ ... }),
      // setLoading: (feature, loading) => set({ ... }),
      // setError: (feature, error) => set({ ... }),
    }),
    // Configuration object for the `persist` middleware
    {
      name: 'codercomm-storage', // Name of the item in localStorage
      // Only persist the currentUser
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);

// Export the hook for components to use
export const useAppStore = useStore;