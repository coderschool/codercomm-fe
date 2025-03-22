import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Central application state manager using Zustand
 * Replaces Redux architecture with a simpler approach
 */
const useStore = create(
  devtools((set) => ({
    // User state
    user: {
      currentUser: null,
      loading: false,
      error: null,
    },
    
    // Post state
    post: {
      posts: [],
      totalPages: 0,
      loading: false,
      error: null,
    },
    
    // Comment state
    comment: {
      comments: {},
      totalCommentsByPost: {},
      loading: false,
      error: null,
    },
    
    // Friend state
    friend: {
      friends: [],
      friendRequests: {
        incoming: [],
        outgoing: [],
      },
      totalPages: 0,
      loading: false,
      error: null,
    },
    
    // Actions - can be organized by feature as in Redux
    
    // User actions
    setCurrentUser: (user) => set((state) => ({
      user: { ...state.user, currentUser: user }
    })),
    
    // Post actions
    setPosts: (posts, totalPages) => set((state) => ({
      post: { ...state.post, posts, totalPages }
    })),
    
    // Comment actions
    setComments: (postId, comments, totalComments) => set((state) => ({
      comment: { 
        ...state.comment, 
        comments: { 
          ...state.comment.comments, 
          [postId]: comments 
        },
        totalCommentsByPost: {
          ...state.comment.totalCommentsByPost,
          [postId]: totalComments
        }
      }
    })),
    
    // Friend actions
    setFriends: (friends, totalPages) => set((state) => ({
      friend: { ...state.friend, friends, totalPages }
    })),
    
    setFriendRequests: (incoming, outgoing) => set((state) => ({
      friend: { 
        ...state.friend, 
        friendRequests: { incoming, outgoing } 
      }
    })),
    
    // Loading state handlers
    setLoading: (feature, loading) => set((state) => ({
      [feature]: { ...state[feature], loading }
    })),
    
    // Error state handlers
    setError: (feature, error) => set((state) => ({
      [feature]: { ...state[feature], error }
    })),
  }))
);

export default useStore;