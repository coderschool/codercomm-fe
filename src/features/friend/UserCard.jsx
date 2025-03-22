import React from 'react';
import { Avatar, Box, Card, Typography, IconButton, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';

import { useSendFriendRequest, useAcceptFriendRequest, useDeclineFriendRequest, useCancelFriendRequest, useRemoveFriend } from './friendHooks';
import { DEFAULT_AVATAR } from '../../lib/config';

function UserCard({ user, actionType = 'add' }) {
  const { mutate: sendRequest } = useSendFriendRequest();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: declineRequest } = useDeclineFriendRequest();
  const { mutate: cancelRequest } = useCancelFriendRequest();
  const { mutate: removeFriend } = useRemoveFriend();
  
  const handleSendRequest = () => {
    sendRequest(user._id);
  };
  
  const handleAcceptRequest = () => {
    acceptRequest(user._id);
  };
  
  const handleDeclineRequest = () => {
    declineRequest(user._id);
  };
  
  const handleCancelRequest = () => {
    cancelRequest(user._id);
  };
  
  const handleRemoveFriend = () => {
    removeFriend(user._id);
  };
  
  const renderAction = () => {
    switch (actionType) {
      case 'add':
        return (
          <IconButton onClick={handleSendRequest} color="primary">
            <PersonAddIcon />
          </IconButton>
        );
      case 'request':
        return (
          <Stack direction="row">
            <IconButton onClick={handleAcceptRequest} color="success" size="small">
              <CheckCircleIcon />
            </IconButton>
            <IconButton onClick={handleDeclineRequest} color="error" size="small">
              <CancelIcon />
            </IconButton>
          </Stack>
        );
      case 'outgoing':
        return (
          <IconButton onClick={handleCancelRequest} color="default" size="small">
            <CloseIcon />
          </IconButton>
        );
      case 'friend':
        return (
          <IconButton onClick={handleRemoveFriend} color="default" size="small">
            <PersonRemoveIcon />
          </IconButton>
        );
      default:
        return null;
    }
  };
  
  // Handle friendship status from API
  const getFriendshipStatus = () => {
    const { friendship } = user;
    if (!friendship) return 'add';
    
    if (friendship.status === 'accepted') return 'friend';
    if (friendship.status === 'pending') {
      if (friendship.from === user._id) return 'request';
      if (friendship.to === user._id) return 'outgoing';
    }
    return 'add';
  };
  
  // Override actionType if friendship data exists
  const effectiveActionType = actionType === 'add' 
    ? getFriendshipStatus() 
    : actionType;
    
  return (
    <Card sx={{ p: 1.5, boxShadow: 0, bgcolor: 'background.neutral', borderRadius: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar 
          src={user.avatarUrl || DEFAULT_AVATAR} 
          alt={user.name}
          component={RouterLink}
          to={`/user/${user._id}`}
          sx={{ width: 48, height: 48 }}
        />
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
            noWrap
            component={RouterLink}
            to={`/user/${user._id}`}
            sx={{ textDecoration: 'none', color: 'text.primary' }}
          >
            {user.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        
        {renderAction()}
      </Stack>
    </Card>
  );
}

export default UserCard;