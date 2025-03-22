import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import LoadingScreen from '../components/LoadingScreen';

function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default GuestRoute;