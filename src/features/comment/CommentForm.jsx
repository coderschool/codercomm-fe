import React, { useState } from 'react';
import { Stack, Avatar, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { useCreateComment } from './commentHooks';
import { useAuth } from '../../lib/auth';

function CommentForm({ postId }) {
  const { user } = useAuth();
  const { mutate: createComment, isPending } = useCreateComment();
  
  const [content, setContent] = useState('');
  
  const handleContentChange = (event) => {
    setContent(event.target.value);
  };
  
  const handleSubmit = () => {
    if (!content.trim()) return;
    
    createComment({ postId, content }, {
      onSuccess: () => {
        setContent('');
      }
    });
  };
  
  // Handle enter key to submit
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
      <Avatar src={user?.avatarUrl} alt={user?.name} sx={{ width: 32, height: 32 }} />
      
      <TextField
        fullWidth
        size="small"
        placeholder="Write a comment..."
        value={content}
        onChange={handleContentChange}
        onKeyPress={handleKeyPress}
        disabled={isPending}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              edge="end"
              color="primary"
            >
              <SendIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </Stack>
  );
}

export default CommentForm;