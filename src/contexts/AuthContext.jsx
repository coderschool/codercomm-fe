import { createContext, useState, useEffect } from "react";
import apiService from "../lib/apiService";
import { isValidToken } from "../utils/jwt";
import useStore from "../lib/store";

// Create context
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get state and actions from Zustand
  const { 
    auth: { isAuthenticated, isInitialized },
    user: { currentUser },
    setCurrentUser,
    setAuth,
    logout: logoutStore
  } = useStore();

  // Set up auth headers for API calls
  const setSession = (accessToken) => {
    if (accessToken) {
      window.localStorage.setItem("accessToken", accessToken);
      apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      window.localStorage.removeItem("accessToken");
      delete apiService.defaults.headers.common.Authorization;
    }
  };

  // Initialize auth once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        
        // No token = not authenticated
        if (!accessToken || !isValidToken(accessToken)) {
          // Clear any existing session data
          setSession(null);
          setAuth(false, true);
          setIsLoading(false);
          return;
        }
        
        // Valid token = authenticated
        // Set token in headers before making API calls
        setSession(accessToken);
        
        // Always fetch fresh user data with valid token
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

  // Auth methods
  const login = async ({ email, password }, callback) => {
    try {
      const response = await apiService.post("/auth/login", { email, password });
      const { user, accessToken } = response;

      setSession(accessToken);
      setCurrentUser(user);

      if (callback) callback();
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async ({ name, email, password }, callback) => {
    try {
      const response = await apiService.post("/users", {
        name,
        email,
        password,
      });

      const { user, accessToken } = response;
      setSession(accessToken);
      setCurrentUser(user);

      if (callback) callback();
      return user;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async (callback) => {
    setSession(null);
    logoutStore();
    if (callback) callback();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Authenticating...</span>
      </div>
    );
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };