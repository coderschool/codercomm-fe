import React from 'react';
import { Box, CircularProgress } from '@mui/material';

function LoadingScreen() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default LoadingScreen;