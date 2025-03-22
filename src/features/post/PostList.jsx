import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useGetPosts, useGetPostsByUser } from './postHooks';
import PostCard from './PostCard';

function PostList({ userId }) {
  const [page, setPage] = useState(1);
  
  // Choose the appropriate query based on whether we're viewing a specific user's posts or the feed
  const {
    data,
    isLoading,
    isError,
    error,
  } = userId 
    ? useGetPostsByUser(userId, page) 
    : useGetPosts(page);
  
  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 0;
  
  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  if (isLoading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" color="error" textAlign="center">
          {error?.message || 'Something went wrong'}
        </Typography>
      </Box>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" textAlign="center">
          No posts yet
        </Typography>
      </Box>
    );
  }
  
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
        {page < totalPages && (
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </Box>
    </>
  );
}

export default PostList;