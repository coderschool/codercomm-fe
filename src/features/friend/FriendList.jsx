import React, { useState } from 'react';
import { Box, Typography, Stack, Pagination, CircularProgress, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useGetFriends } from './friendHooks';
import UserCard from './UserCard';

function FriendList() {
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [filterName, setFilterName] = useState('');
  
  const { data, isLoading } = useGetFriends(filterName, page);
  
  const friends = data?.users || [];
  const totalPages = data?.totalPages || 1;
  
  const handleSearchChange = (event) => {
    setSearchName(event.target.value);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    setFilterName(searchName);
  };
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={searchName}
          onChange={handleSearchChange}
          placeholder="Search friends..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <UserCard key={friend._id} user={friend} />
              ))
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                {filterName 
                  ? `No friends found for "${filterName}"`
                  : "You don't have any friends yet"
                }
              </Typography>
            )}
          </Stack>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                size="small"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default FriendList;