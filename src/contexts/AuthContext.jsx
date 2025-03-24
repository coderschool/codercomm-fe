import { createContext, useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import useStore from "../lib/store";
import { checkAuthToken, setSession, useLogin, useRegister, useLogout } from "../features/user/authHooks";
import apiService from "../lib/apiService";

// Create context
const AuthContext = createContext(null);

/**
 * Authentication provider component
 * Uses React Query for data fetching and Zustand for state management
 */
function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get state and actions from Zustand
  const { 
    auth: { isAuthenticated, isInitialized },
    user: { currentUser },
    setCurrentUser,
    setAuth,
  } = useStore();

  // Auth mutation hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Initialize auth once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a valid token
        const { isValid, accessToken } = checkAuthToken();
        
        // No valid token? Early return
        if (!isValid) {
          setAuth(false, true);
          setIsLoading(false);
          return;
        }
        
        // Valid token - get user data
        try {
          const user = await apiService.get("/users/me");
          setCurrentUser(user);
          setAuth(true, true);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Token might be invalid despite passing our check
          setSession(null);
          setCurrentUser(null);
          setAuth(false, true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setSession(null);
        setCurrentUser(null);
        setAuth(false, true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API for auth actions
  const login = async (credentials, callback) => {
    const result = await loginMutation.mutateAsync(credentials);
    if (callback) callback();
    return result.user;
  };

  const register = async (userData, callback) => {
    const result = await registerMutation.mutateAsync(userData);
    if (callback) callback();
    return result.user;
  };

  const logout = async (callback) => {
    await logoutMutation.mutateAsync();
    if (callback) callback();
  };

  // Show loading state
  if (isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user: currentUser,
        login,
        register,
        logout,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };