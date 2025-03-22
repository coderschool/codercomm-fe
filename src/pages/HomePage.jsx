import React, { useEffect } from 'react';
import { Box, Container, Stack, Card, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import PostForm from '../features/post/PostForm';
import PostList from '../features/post/PostList';
import { useAuth } from '../lib/auth';
import { useGetCurrentUserProfile } from '../features/user/userHooks';
import ProfileCard from '../components/ProfileCard';
import FriendList from '../features/friend/FriendList';
import FriendRequests from '../features/friend/FriendRequests';
import LoadingScreen from '../components/LoadingScreen';

function HomePage() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = useGetCurrentUserProfile();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isError) {
    return (
      <Container>
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            There was an error loading your profile.
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Home | CoderComm</title>
      </Helmet>
      
      <Container>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center">
          {/* Left column */}
          <Stack spacing={3} sx={{ width: { xs: '100%', md: 300 } }}>
            <ProfileCard profile={profile} />
            
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Friend Requests
              </Typography>
              <FriendRequests />
            </Card>
          </Stack>
          
          {/* Middle column - Posts */}
          <Box sx={{ flexGrow: 1, maxWidth: 600 }}>
            <PostForm />
            <PostList />
          </Box>
          
          {/* Right column */}
          <Stack spacing={3} sx={{ width: { xs: '100%', md: 300 }, display: { xs: 'none', md: 'block' } }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Friends
              </Typography>
              <FriendList />
            </Card>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default HomePage;