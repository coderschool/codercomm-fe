import { useAppStore } from '../lib/store';

/**
 * Custom Hook: useAuth
 * Provides convenient access to authentication-related state and actions
 * from the Zustand store.
 * Selects only the necessary pieces of state to optimize re-renders.
 * @returns {object} An object containing auth state and actions.
 */
const useAuth = () => {
  // Use the store hook and a selector function to get specific state pieces.
  // This ensures the component only re-renders if these specific pieces change.
  const { 
    isAuthenticated, // boolean: Is the user logged in?
    isInitialized,   // boolean: Has auth check finished on app load?
    currentUser,     // object | null: The logged-in user data
    login,           // function: Action to log in
    register,        // function: Action to register
    logout,          // function: Action to log out
    isLoadingAuth,   // boolean: Is any auth operation in progress?
    errorAuth,       // string | null: Any error message from auth operations
  } = useAppStore(state => ({
    // Selector function maps store state to the hook's return values
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    currentUser: state.currentUser,
    login: state.login,
    register: state.register,
    logout: state.logout,
    isLoadingAuth: state.isLoading.auth, // Get specific loading state
    errorAuth: state.errors.auth,       // Get specific error state
  }));

  // Return the selected state and actions in a structured object
  return {
    isAuthenticated,
    isInitialized,
    user: currentUser, // Rename currentUser to user for common usage
    login,
    register,
    logout,
    // Combine loading/error states for easier consumption in components (optional)
    isLoading: isLoadingAuth,
    error: errorAuth,
    // Booleans for specific states (derived from isLoadingAuth)
    // Note: These might not be perfectly accurate if multiple auth actions run concurrently,
    // but often sufficient for UI feedback.
    isLoggingIn: isLoadingAuth,
    isRegistering: isLoadingAuth,
    isLoggingOut: isLoadingAuth, // Logout is usually synchronous, but handled for consistency
  };
};

export default useAuth;