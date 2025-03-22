import React, { useState } from 'react';
import { Card, Box, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ShareIcon from '@mui/icons-material/Share';

import { useReactPost } from './postHooks';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/formatters';
import CommentList from '../comment/CommentList';
import CommentForm from '../comment/CommentForm';

function PostCard({ post }) {
  const { user } = useAuth();
  const { mutate: reactPost } = useReactPost();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [showComments, setShowComments] = useState(false);
  
  // Handle reaction
  const handleReact = (emoji) => {
    reactPost({ postId: post._id, emoji });
  };
  
  // Check if user has reacted to this post
  const isLiked = post?.reactions?.some(
    (reaction) => reaction.emoji === 'like' && reaction.author._id === user?._id
  );
  
  const isDisliked = post?.reactions?.some(
    (reaction) => reaction.emoji === 'dislike' && reaction.author._id === user?._id
  );
  
  // Count reactions
  const likesCount = post?.reactions?.filter((reaction) => reaction.emoji === 'like').length || 0;
  const dislikesCount = post?.reactions?.filter((reaction) => reaction.emoji === 'dislike').length || 0;
  
  // Menu operations
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditPost = () => {
    handleMenuClose();
    // Implement edit functionality
  };
  
  const handleDeletePost = () => {
    handleMenuClose();
    // Implement delete functionality
  };
  
  // Check if post belongs to the current user
  const isPostAuthor = post?.author?._id === user?._id;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={
          <Avatar 
            src={post?.author?.avatarUrl}
            alt={post?.author?.name}
            component={Link}
            to={`/user/${post?.author?._id}`}
            sx={{ textDecoration: 'none' }}
          />
        }
        title={
          <Link 
            to={`/user/${post?.author?._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {post?.author?.name}
          </Link>
        }
        subheader={formatDate(post?.createdAt)}
        action={
          isPostAuthor && (
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )
        }
      />
      
      <Menu
        id="post-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditPost}>Edit</MenuItem>
        <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
      </Menu>
      
      <CardContent>
        <Typography variant="body1" color="text.primary">
          {post?.content}
        </Typography>
        
        {post?.image && (
          <Box 
            component="img"
            sx={{
              mt: 2,
              borderRadius: 1,
              width: '100%',
              height: 'auto',
              maxHeight: 400,
              objectFit: 'cover',
            }}
            src={post.image}
            alt="Post"
          />
        )}
      </CardContent>
      
      <CardActions>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => handleReact('like')}
            color={isLiked ? 'primary' : 'default'}
          >
            <ThumbUpAltIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {likesCount}
          </Typography>
          
          <IconButton 
            onClick={() => handleReact('dislike')}
            color={isDisliked ? 'primary' : 'default'}
          >
            <ThumbDownAltIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {dislikesCount}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <IconButton onClick={() => setShowComments(!showComments)}>
            <ChatBubbleIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {post?.commentCount || 0}
          </Typography>
          
          <IconButton>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
      
      {showComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          <CommentForm postId={post?._id} />
          <CommentList postId={post?._id} />
        </Box>
      )}
    </Card>
  );
}

export default PostCard;