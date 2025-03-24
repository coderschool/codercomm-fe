import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        // User state
        user: {
          currentUser: null,
          selectedUser: null,
          loading: false,
          error: null,
        },
        
        // Auth state
        auth: {
          isAuthenticated: false,
          isInitialized: false,
        },
        
        // UI state
        ui: {
          themeMode: 'light',
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
        
        // User actions
        setCurrentUser: (user) => set((state) => ({
          user: { ...state.user, currentUser: user },
          auth: { 
            ...state.auth, 
            isAuthenticated: Boolean(user),
            isInitialized: true
          }
        })),
        
        setSelectedUser: (user) => set((state) => ({
          user: { ...state.user, selectedUser: user }
        })),
        
        // Auth actions
        setAuth: (isAuthenticated, isInitialized) => set((state) => ({
          auth: { ...state.auth, isAuthenticated, isInitialized }
        })),
        
        logout: () => set((state) => ({
          user: { ...state.user, currentUser: null },
          auth: { ...state.auth, isAuthenticated: false }
        })),
        
        // Theme actions
        toggleTheme: () => set((state) => ({
          ui: { 
            ...state.ui, 
            themeMode: state.ui.themeMode === 'light' ? 'dark' : 'light' 
          }
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
        
        // Loading and error state
        setLoading: (feature, loading) => set((state) => ({
          [feature]: { ...state[feature], loading }
        })),
        
        setError: (feature, error) => set((state) => ({
          [feature]: { ...state[feature], error }
        })),
      }),
      {
        name: 'codercomm-storage',
        partialize: (state) => ({ 
          ui: state.ui,
          auth: { isAuthenticated: state.auth.isAuthenticated },
          user: { currentUser: state.user.currentUser }
        }),
      }
    )
  )
);

export default useStore;