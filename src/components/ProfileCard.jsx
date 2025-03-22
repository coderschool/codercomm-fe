import React from 'react';
import { Card, Box, Avatar, Typography, Stack, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import { DEFAULT_AVATAR } from '../lib/config';

function ProfileCard({ profile }) {
  if (!profile) return null;
  
  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          src={profile.avatarUrl || DEFAULT_AVATAR}
          alt={profile.name}
          sx={{ 
            width: 100, 
            height: 100,
            mb: 2,
            border: '1px solid #ddd'
          }}
        />
        
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {profile.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {profile.email}
        </Typography>
        
        <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonIcon color="primary" fontSize="small" />
            <Typography variant="body2">
              {profile.friendCount || 0} {profile.friendCount === 1 ? 'friend' : 'friends'}
            </Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <ArticleIcon color="primary" fontSize="small" />
            <Typography variant="body2">
              {profile.postCount || 0} {profile.postCount === 1 ? 'post' : 'posts'}
            </Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmailIcon color="primary" fontSize="small" />
            <Typography variant="body2">
              {profile.email}
            </Typography>
          </Stack>
        </Stack>
        
        <Box sx={{ mt: 2, width: '100%' }}>
          <MuiLink
            component={RouterLink}
            to={`/user/${profile._id}`}
            variant="button"
            color="primary"
            sx={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
          >
            View Profile
          </MuiLink>
        </Box>
      </Box>
    </Card>
  );
}

export default ProfileCard;