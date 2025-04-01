import useStore from '../lib/store';

/**
 * Hook to access authentication state and actions
 * @returns {Object} Auth state and actions
 * - isAuthenticated: Boolean indicating if user is logged in
 * - isInitialized: Boolean indicating if auth is initialized
 * - user: Current user object or null
 * - login: Function to log in
 * - register: Function to register
 * - logout: Function to log out
 * - isLoggingIn: Boolean indicating if login is in progress
 */
const useAuth = () => {
  const { 
    isAuthenticated,
    isInitialized, 
    currentUser, 
    login, 
    register, 
    logout,
    isLoading,
  } = useStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    currentUser: state.currentUser,
    login: state.login,
    register: state.register,
    logout: state.logout,
    isLoading: state.isLoading.auth,
  }));

  return {
    isAuthenticated,
    isInitialized,
    user: currentUser,
    login,
    register,
    logout,
    isLoggingIn: isLoading,
    isRegistering: isLoading,
    isLoggingOut: isLoading,
  };
};

export default useAuth;