import React, { useState } from 'react';
import { Avatar, Box, Paper, Stack, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useReactComment, useDeleteComment } from './commentHooks';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/formatters';

function CommentCard({ comment, postId }) {
  const { user } = useAuth();
  const { mutate: reactComment } = useReactComment();
  const { mutate: deleteComment } = useDeleteComment();
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Handle reaction
  const handleReact = (emoji) => {
    reactComment({ commentId: comment._id, emoji });
  };
  
  // Check if user has reacted to this comment
  const isLiked = comment?.reactions?.some(
    (reaction) => reaction.emoji === 'like' && reaction.author._id === user?._id
  );
  
  const isDisliked = comment?.reactions?.some(
    (reaction) => reaction.emoji === 'dislike' && reaction.author._id === user?._id
  );
  
  // Count reactions
  const likesCount = comment?.reactions?.filter((reaction) => reaction.emoji === 'like').length || 0;
  const dislikesCount = comment?.reactions?.filter((reaction) => reaction.emoji === 'dislike').length || 0;
  
  // Menu operations
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditComment = () => {
    handleMenuClose();
    // Implement edit functionality
  };
  
  const handleDeleteComment = () => {
    handleMenuClose();
    deleteComment({ commentId: comment._id, postId });
  };
  
  // Check if comment belongs to the current user
  const isCommentAuthor = comment?.author?._id === user?._id;
  
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
      <Avatar 
        src={comment?.author?.avatarUrl}
        alt={comment?.author?.name}
        component={Link}
        to={`/user/${comment?.author?._id}`}
        sx={{ textDecoration: 'none', width: 32, height: 32 }}
      />
      
      <Box sx={{ flexGrow: 1 }}>
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            position: 'relative',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              variant="subtitle2"
              component={Link}
              to={`/user/${comment?.author?._id}`}
              sx={{ color: 'text.primary', textDecoration: 'none' }}
            >
              {comment?.author?.name}
            </Typography>
            
            {isCommentAuthor && (
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={handleMenuOpen}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
            {comment?.content}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => handleReact('like')}
              color={isLiked ? 'primary' : 'default'}
            >
              <ThumbUpAltIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption">{likesCount}</Typography>
            
            <IconButton 
              size="small" 
              onClick={() => handleReact('dislike')}
              color={isDisliked ? 'primary' : 'default'}
            >
              <ThumbDownAltIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption">{dislikesCount}</Typography>
            
            <Typography variant="caption" sx={{ ml: 'auto' }}>
              {formatDate(comment?.createdAt)}
            </Typography>
          </Stack>
        </Paper>
        
        <Menu
          id="comment-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditComment}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteComment}>Delete</MenuItem>
        </Menu>
      </Box>
    </Stack>
  );
}

export default CommentCard;