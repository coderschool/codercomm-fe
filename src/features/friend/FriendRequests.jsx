import React, { useState } from 'react';
import { Box, Typography, Stack, CircularProgress, Tab, Tabs } from '@mui/material';
import { useGetFriendRequests, useGetOutgoingRequests } from './friendHooks';
import UserCard from './UserCard';

function FriendRequests() {
  const [tab, setTab] = useState('incoming');
  
  const { 
    data: incomingData, 
    isLoading: incomingLoading 
  } = useGetFriendRequests('', 1);
  
  const { 
    data: outgoingData, 
    isLoading: outgoingLoading 
  } = useGetOutgoingRequests('', 1);
  
  const incomingRequests = incomingData?.users || [];
  const outgoingRequests = outgoingData?.users || [];
  
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  
  const isLoading = tab === 'incoming' ? incomingLoading : outgoingLoading;
  const requests = tab === 'incoming' ? incomingRequests : outgoingRequests;
  
  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab 
          label={`Incoming (${incomingRequests.length || 0})`} 
          value="incoming" 
        />
        <Tab 
          label={`Outgoing (${outgoingRequests.length || 0})`} 
          value="outgoing" 
        />
      </Tabs>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {requests.length > 0 ? (
            requests.map((user) => (
              <UserCard 
                key={user._id} 
                user={user} 
                actionType={tab === 'incoming' ? 'request' : 'outgoing'} 
              />
            ))
          ) : (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {tab === 'incoming' 
                ? "No incoming friend requests" 
                : "No outgoing friend requests"
              }
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default FriendRequests;