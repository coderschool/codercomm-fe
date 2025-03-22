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
        
        // Loading and error state
        setLoading: (loading) => set((state) => ({
          user: { ...state.user, loading }
        })),
        
        setError: (error) => set((state) => ({
          user: { ...state.user, error }
        })),
      }),
      {
        name: 'codercomm-storage',
        partialize: (state) => ({ 
          ui: state.ui,
          auth: { isAuthenticated: state.auth.isAuthenticated } 
        }),
      }
    )
  )
);

export default useStore;