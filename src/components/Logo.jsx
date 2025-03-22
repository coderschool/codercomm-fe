import React from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Logo({ sx }) {
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: 'inline-flex',
        ...sx,
      }}
    >
      <Box 
        component="img" 
        src="/logo.png" 
        alt="CoderComm Logo" 
        sx={{ width: '100%', height: '100%' }} 
      />
    </Box>
  );
}

export default Logo;