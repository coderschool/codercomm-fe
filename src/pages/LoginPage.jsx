import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Box, Typography, Stack, Link, Alert, IconButton, InputAdornment, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';

import Logo from '../components/Logo';
import { useAuth } from '../lib/auth';
import { FormProvider, FTextField } from '../components/form';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const from = location.state?.from?.pathname || '/';
  
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const { handleSubmit } = methods;
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Login | CoderComm</title>
      </Helmet>
      
      <Container maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            justifyContent: 'center',
            py: 5,
          }}
        >
          <Card sx={{ p: 4, width: '100%', maxWidth: 500 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Logo sx={{ width: 60, height: 60, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="subtitle2">
                  Get started
                </Link>
              </Typography>
            </Box>
            
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                {error && <Alert severity="error">{error}</Alert>}
                
                <FTextField 
                  name="email" 
                  label="Email address" 
                  autoComplete="email" 
                />
                
                <FTextField
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={loading}
                sx={{ mt: 3 }}
              >
                Login
              </LoadingButton>
            </FormProvider>
          </Card>
        </Box>
      </Container>
    </>
  );
}

export default LoginPage;