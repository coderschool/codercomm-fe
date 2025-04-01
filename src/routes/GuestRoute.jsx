import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Route wrapper for guest-only pages (login/register)
 * Redirects to home if user is already authenticated
 */
function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default GuestRoute;