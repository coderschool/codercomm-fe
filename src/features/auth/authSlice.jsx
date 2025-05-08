import apiService from "@/lib/apiService";
import { isValidToken, setSession } from "@/lib/jwt";
import { toast } from "sonner";

export const authSlice = (set, get) => ({
  // Authentication State
  currentUser: null, // Holds the logged-in user object (null if not logged in)
  isLoadingAuth: false, // Loading state specifically for auth operations
  authError: null, // Errors specifically from auth operations

  // Auth Actions
  initializeAuth: async () => {
    // This action runs when the app starts
    set({ isLoadingAuth: true, authError: null });
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const user = await apiService.get("/users/me");
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
        authError: error.message || "Failed to initialize authentication",
      });
      return false;
    }
  },

  login: async (credentials) => {
    set({ isLoadingAuth: true, authError: null });
    try {
      const response = await apiService.post("/auth/login", credentials);
      const { user, accessToken } = response;
      setSession(accessToken);
      set({
        currentUser: user,
        isLoadingAuth: false,
      });
      toast.success("Login successful");
      return user;
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = error?.message || "Login failed";
      set({ isLoadingAuth: false, authError: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: () => {
    setSession(null);
    set({ currentUser: null, authError: null });
    toast.success("Logged out successfully");
  },
});
