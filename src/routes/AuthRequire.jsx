import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Route wrapper for protected routes
 * Redirects to login if user is not authenticated
 */
function AuthRequire({ children }) {
  const { isInitialized, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AuthRequire;
