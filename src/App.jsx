import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useStore from './lib/store';
import { useAuth } from './lib/auth';
import { useTheme } from './hooks/useTheme';

// Layouts
import MainLayout from './layouts/MainLayout';
import BlankLayout from './layouts/BlankLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';

// Routes
import AuthRequire from './routes/AuthRequire';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { theme } = useTheme();
  const { initialize, isInitialized } = useAuth();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Routes>
        <Route path="/" element={<AuthRequire><MainLayout /></AuthRequire>}>
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="user/:userId" element={<UserProfilePage />} />
        </Route>
        
        <Route path="/" element={<BlankLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}

export default App;