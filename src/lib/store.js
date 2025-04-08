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
      isLoadingAuth: true,     // Loading state specifically for auth operations
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
      
      // --- NEW: User Profile State ---
      // Store profiles by userId to avoid re-fetching
      userProfiles: {},
      // Example: { userId1: { data: {...}, isLoading: false, error: null }, userId2: ... }
      
      // --- NEW: User Posts State ---
      // Store posts per user ID
      userPosts: {},
      // Example: { userId1: { list: [], isLoading: false, error: null, totalPages: 1 }, userId2: ... }

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

      /**
       * Creates a new post.
       * @param {object} postData - { content, image? }
       */
      createPost: async (postData) => {
        console.log("Attempting to create post:", postData);
        try {
          const newPost = await apiService.post('/posts', postData);
          toast.success('Post created successfully!');
          console.log("✅ Post created:", newPost);
          set((state) => {
            const authorId = newPost.author._id;
            const updatedUserPosts = { ...state.userPosts };
            // Only update user-specific posts if they are already cached
            if (updatedUserPosts[authorId]?.list) {
              updatedUserPosts[authorId] = {
                ...updatedUserPosts[authorId],
                // Prepend to the specific user's post list
                list: [newPost, ...updatedUserPosts[authorId].list],
              };
            } else {
               // If not cached, initialize it for the current user
               // This ensures the post appears immediately on the home page
               if (authorId === state.currentUser?._id) {
                   updatedUserPosts[authorId] = { list: [newPost], isLoading: false, error: null, totalPages: 1 };
               }
            }
            return { userPosts: updatedUserPosts };
          });
          return newPost;
        } catch (error) {
          console.error("❌ Create Post Error:", error);
          toast.error(error.message || 'Failed to create post');
          throw error;
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

      reactToPost: async (postId, emoji) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        console.log(`Attempting reaction (${emoji}) on post ${postId}...`);
        try {
          set(state => {
            const updatedUserPosts = { ...state.userPosts };
            let userIdForPost = null;
            let postUpdated = false;

            // Find the user whose post list contains this post
            for (const userId in updatedUserPosts) {
                 const userPostList = updatedUserPosts[userId]?.list;
                 if (userPostList) {
                     const postIndex = userPostList.findIndex(p => p._id === postId);
                     if (postIndex !== -1) {
                         userIdForPost = userId;
                         const post = userPostList[postIndex];
                         const existingReactionIndex = post.reactions?.findIndex(
                             r => r.author._id === currentUser._id && r.emoji === emoji
                         );
                         let newReactions = [...(post.reactions || [])];
                         if (existingReactionIndex !== -1) {
                            newReactions.splice(existingReactionIndex, 1);
                         } else {
                            newReactions.push({ _id: `temp-${Date.now()}`, author: { _id: currentUser._id, name: currentUser.name, avatarUrl: currentUser.avatarUrl }, emoji: emoji });
                         }
                         updatedUserPosts[userId].list[postIndex] = { ...post, reactions: newReactions };
                         postUpdated = true;
                         break; // Found and updated the post
                     }
                 }
            }
            // Return state only if an update occurred
            return postUpdated ? { userPosts: updatedUserPosts } : state;
          });
          await apiService.post('/reactions', { targetType: 'Post', targetId: postId, emoji });
          console.log(`✅ Reaction (${emoji}) successful for post ${postId}`);
        } catch (error) {
          console.error(`❌ React to Post Error (${postId}):`, error);
          toast.error(error.message || 'Failed to react to post');
          // TODO: Revert optimistic update
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
        console.log(`Attempting to create comment on post ${postId}:`, commentData);
        try {
          const newComment = await apiService.post(`/posts/${postId}/comments`, commentData);
          toast.success('Comment added successfully!');
          console.log("✅ Comment created:", newComment);
          set((state) => {
            const postComments = state.comments[postId] || { list: [], isLoading: false, error: null };
            let authorId = null;
            const updatedUserPosts = { ...state.userPosts };
            
            // Find the post in userPosts cache to update count
             for (const userId in updatedUserPosts) {
                 const postIndex = updatedUserPosts[userId]?.list?.findIndex(p => p._id === postId);
                 if (postIndex !== -1) {
                     authorId = userId;
                     updatedUserPosts[userId].list[postIndex] = {
                        ...updatedUserPosts[userId].list[postIndex],
                        commentCount: (updatedUserPosts[userId].list[postIndex].commentCount || 0) + 1
                     };
                     break;
                 }
             }

            return {
              comments: { ...state.comments, [postId]: { ...postComments, list: [newComment, ...(postComments.list || [])] } },
              userPosts: updatedUserPosts, // Update user posts with new count
            };
          });
          return newComment;
        } catch (error) {
          console.error(`❌ Create Comment Error (Post ${postId}):`, error);
          toast.error(error.message || 'Failed to add comment');
          throw error;
        }
      },

      deleteComment: async (commentId) => {
         console.log(`Attempting to delete comment ${commentId}...`);
         try {
           await apiService.delete(`/comments/${commentId}`);
           toast.success('Comment deleted successfully!');
           set((state) => {
              let postIdToUpdate = null;
              let authorId = null;
              const updatedComments = { ...state.comments };
              const updatedPosts = [...state.posts];
              const updatedUserPosts = { ...state.userPosts };
              
              for (const postId in updatedComments) {
                 const commentIndex = updatedComments[postId]?.list?.findIndex(c => c._id === commentId);
                 if (commentIndex !== -1) {
                    postIdToUpdate = postId;
                    updatedComments[postId] = {
                       ...updatedComments[postId],
                       list: updatedComments[postId].list.filter(c => c._id !== commentId),
                    };
                    break;
                 }
              }
              
              if (postIdToUpdate) {
                 // Update main post list count
                 const postIndex = updatedPosts.findIndex(p => p._id === postIdToUpdate);
                 if (postIndex !== -1) {
                      authorId = updatedPosts[postIndex].author._id;
                      updatedPosts[postIndex] = {
                         ...updatedPosts[postIndex],
                         commentCount: Math.max(0, (updatedPosts[postIndex].commentCount || 0) - 1)
                      };
                 }
                 // Update user-specific post list count
                 if (authorId && updatedUserPosts[authorId]?.list) {
                     const userPostIndex = updatedUserPosts[authorId].list.findIndex(p => p._id === postIdToUpdate);
                     if (userPostIndex !== -1) {
                         updatedUserPosts[authorId].list[userPostIndex] = {
                           ...updatedUserPosts[authorId].list[userPostIndex],
                           commentCount: Math.max(0, (updatedUserPosts[authorId].list[userPostIndex].commentCount || 0) - 1)
                         };
                     }
                 }
              }
              
              return { comments: updatedComments, posts: updatedPosts, userPosts: updatedUserPosts };
           });
           console.log(`✅ Comment ${commentId} deleted.`);
         } catch (error) {
           console.error(`❌ Delete Comment Error (${commentId}):`, error);
           const errorMessage = error.message || 'Failed to delete comment';
           toast.error(errorMessage);
           throw error;
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

      sendFriendRequest: async (targetUserId) => {
        console.log(`Attempting send request to ${targetUserId}...`);
        try {
          const response = await apiService.post('/friends/requests', { userId: targetUserId });
          toast.success('Friend request sent!');
          set(state => {
            const newRequest = response.friendship;
            if (!newRequest) return state;
            const updatedOutgoing = [newRequest, ...state.friendRequests.outgoing];
            const updatedUsersList = state.users.list.map(u => u._id === targetUserId ? { ...u, friendship: newRequest } : u );
            const updatedUserProfiles = { ...state.userProfiles };
            if (updatedUserProfiles[targetUserId]) {
                updatedUserProfiles[targetUserId] = { ...updatedUserProfiles[targetUserId], data: { ...(updatedUserProfiles[targetUserId].data || {}), friendship: newRequest } };
            }
            return { friendRequests: { ...state.friendRequests, outgoing: updatedOutgoing }, users: { ...state.users, list: updatedUsersList }, userProfiles: updatedUserProfiles };
          });
          console.log(`✅ Request sent to ${targetUserId}`);
        } catch (error) {
          console.error(`❌ Send Friend Request Error to ${targetUserId}:`, error);
          toast.error(error.message || 'Failed to send request');
          throw error;
        }
      },

      acceptFriendRequest: async (requestId) => {
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

      cancelFriendRequest: async (requestId) => {
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

      // --- NEW: User Profile Actions ---

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
            [userId]: { ...(state.userProfiles[userId] || {}), isLoading: true, error: null },
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
          const errorMessage = error.message || 'Failed to fetch profile';
          set((state) => ({
            userProfiles: {
              ...state.userProfiles,
              [userId]: { ...(state.userProfiles[userId] || {}), isLoading: false, error: errorMessage },
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
          const response = await apiService.put('/users/me', updatedData);
          const updatedUser = response.user;
          // Update currentUser state
          set({ currentUser: updatedUser });
          toast.success("Profile updated successfully!");
          console.log("✅ Profile updated:", updatedUser);
          return updatedUser;
        } catch (error) {
          console.error("❌ Update Profile Error:", error);
          const errorMessage = error.message || 'Failed to update profile';
          toast.error(errorMessage);
          throw error; // Re-throw for form error handling
        }
      },

      // --- NEW: User Posts Actions ---

      /**
       * Fetches posts for a specific user.
       * @param {string} userId
       * @param {number} page
       * @param {number} limit
       */
      fetchUserPosts: async (userId, page = 1, limit = 10) => {
        const existingPostsState = get().userPosts[userId];
        // Avoid refetch if already loading (can add logic to check if data exists too)
        if (existingPostsState?.isLoading) return;
        
        set((state) => ({
          userPosts: {
            ...state.userPosts,
            [userId]: { ...(state.userPosts[userId] || {}), isLoading: true, error: null },
          },
        }));
        console.log(`Attempting fetch posts for user ${userId}...`);
        try {
          // Assuming endpoint like /posts/user/:userId
          const response = await apiService.get(`/posts/user/${userId}`, {
            params: { page, limit },
          });
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
           console.log(`✅ Posts fetched for user ${userId}:`, response.posts?.length || 0);
        } catch (error) {
          console.error(`❌ Fetch User Posts Error (${userId}):`, error);
          const errorMessage = error.message || 'Failed to fetch user posts';
          set((state) => ({
            userPosts: {
              ...state.userPosts,
              [userId]: { ...(state.userPosts[userId] || {}), isLoading: false, error: errorMessage },
            },
          }));
          toast.error(`Failed to load posts for user ${userId}`);
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
      name: 'codercomm-auth-storage', 
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);

// Export the hook for components to use
export const useAppStore = useStore;