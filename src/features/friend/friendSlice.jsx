import apiService from "@/lib/apiService";
import { toast } from "sonner";

export const friendSlice = (set, get) => ({
  // Friend State
  friends: { list: [], isLoading: false, error: null, totalPages: 1 },
  friendRequests: {
    incoming: [],
    outgoing: [],
    isLoading: false,
    error: null,
  },

  // Friend Actions
  fetchFriends: async (page = 1, limit = 10, query = "") => {
    set((state) => ({
      friends: { ...state.friends, isLoading: true, error: null },
    }));
    try {
      const response = await apiService.get("/friends", {
        params: { page, limit, query },
      });
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
      const errorMessage = error?.message || "Failed to fetch friends";
      set((state) => ({
        friends: {
          ...state.friends,
          isLoading: false,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
    }
  },

  fetchFriendRequests: async () => {
    set((state) => ({
      friendRequests: {
        ...state.friendRequests,
        isLoading: true,
        error: null,
      },
    }));
    try {
      // Assume endpoint returns { incoming: [...], outgoing: [...] }
      const response = await apiService.get("/friends/requests");
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
      const errorMessage = error?.message || "Failed to fetch friend requests";
      set((state) => ({
        friendRequests: {
          ...state.friendRequests,
          isLoading: false,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
    }
  },

  fetchUsers: async (query = "", page = 1, limit = 10) => {
    set((state) => ({
      users: { ...state.users, isLoading: true, error: null },
    }));
    try {
      // Assuming endpoint /users for searching non-friends
      const response = await apiService.get("/users", {
        params: { query, page, limit },
      });
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
      const errorMessage = error?.message || "Failed to search users";
      set((state) => ({
        users: { ...state.users, isLoading: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    }
  },

  sendFriendRequest: async (targetUserId) => {
    console.log(`Attempting send request to ${targetUserId}...`);
    try {
      const response = await apiService.post("/friends/requests", {
        userId: targetUserId,
      });
      toast.success("Friend request sent!");
      set((state) => {
        const newRequest = response.friendship;
        if (!newRequest) return state;
        const updatedOutgoing = [newRequest, ...state.friendRequests.outgoing];
        const updatedUsersList = state.users.list.map((u) =>
          u._id === targetUserId ? { ...u, friendship: newRequest } : u
        );
        const updatedUserProfiles = { ...state.userProfiles };
        if (updatedUserProfiles[targetUserId]) {
          updatedUserProfiles[targetUserId] = {
            ...updatedUserProfiles[targetUserId],
            data: {
              ...(updatedUserProfiles[targetUserId].data || {}),
              friendship: newRequest,
            },
          };
        }
        return {
          friendRequests: {
            ...state.friendRequests,
            outgoing: updatedOutgoing,
          },
          users: { ...state.users, list: updatedUsersList },
          userProfiles: updatedUserProfiles,
        };
      });
      console.log(`✅ Request sent to ${targetUserId}`);
    } catch (error) {
      console.error(`❌ Send Friend Request Error to ${targetUserId}:`, error);
      toast.error(error.message || "Failed to send request");
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

      toast.success("Friend request accepted! (Mock)");
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
      toast.success("Friend request rejected. (Mock)");
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
      toast.success("Friend request cancelled. (Mock)");
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

  removeFriend: async (friendshipId) => {
    // Or maybe use friend's userId?
    try {
      // Assuming endpoint DELETE /friends/:id where id is friendship or friend's user id
      await apiService.delete(`/friends/${friendshipId}`);
      toast.success("Friend removed.");
      // Refetch friends list
      get().fetchFriends();
      // Potentially refetch user search/profiles if needed
    } catch (error) {
      console.error("Remove Friend Error:", error);
      const errorMessage = error?.message || "Failed to remove friend";
      toast.error(errorMessage);
    }
  },
});
