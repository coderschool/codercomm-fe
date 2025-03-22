import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useGetComments } from './commentHooks';
import CommentCard from './CommentCard';

function CommentList({ postId }) {
  const [page, setPage] = useState(1);
  
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetComments(postId, page);
  
  const comments = data?.comments || [];
  const totalComments = data?.count || 0;
  const totalPages = data?.totalPages || 0;
  
  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  if (isLoading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="error" textAlign="center">
          {error?.message || 'Something went wrong'}
        </Typography>
      </Box>
    );
  }
  
  if (comments.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No comments yet
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {comments.map((comment) => (
        <CommentCard key={comment._id} comment={comment} postId={postId} />
      ))}
      
      {totalComments > comments.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            size="small"
            color="primary"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more comments'}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default CommentList;