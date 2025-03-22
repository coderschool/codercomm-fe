import { jwtDecode } from 'jwt-decode';
import apiService from './apiService';
import useStore from './store';

export const isValidToken = (accessToken) => {
  if (!accessToken) return false;
  
  try {
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete apiService.defaults.headers.common.Authorization;
  }
};

export const useAuth = () => {
  const { 
    auth: { isAuthenticated, isInitialized },
    user: { currentUser },
    setCurrentUser,
    setAuth,
    logout: logoutStore
  } = useStore();
  
  const login = async (email, password) => {
    const response = await apiService.post('/auth/login', { email, password });
    const { user, accessToken } = response;
    
    setSession(accessToken);
    setCurrentUser(user);
    
    return user;
  };
  
  const register = async (name, email, password) => {
    const response = await apiService.post('/users', { name, email, password });
    const { user, accessToken } = response;
    
    setSession(accessToken);
    setCurrentUser(user);
    
    return user;
  };
  
  const logout = () => {
    setSession(null);
    logoutStore();
  };
  
  const initialize = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const response = await apiService.get('/users/me');
        setCurrentUser(response);
        return true;
      } else {
        setSession(null);
        setAuth(false, true);
        return false;
      }
    } catch (error) {
      setSession(null);
      setAuth(false, true);
      return false;
    }
  };
  
  return { 
    isAuthenticated,
    isInitialized,
    user: currentUser,
    login,
    register,
    logout,
    initialize
  };
};