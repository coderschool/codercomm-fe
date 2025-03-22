import React, { useState } from 'react';
import { Box, Card, Stack, Avatar, Typography, TextField, IconButton, Button } from '@mui/material';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useAuth } from '../../lib/auth';
import { useCreatePost } from './postHooks';

function PostForm() {
  const { user } = useAuth();
  const { mutate: createPost, isPending } = useCreatePost();
  
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const handleContentChange = (event) => {
    setContent(event.target.value);
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl('');
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    
    try {
      await createPost({ content, image });
      setContent('');
      setImage(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" spacing={2}>
        <Avatar src={user?.avatarUrl} alt={user?.name} />
        
        <Stack sx={{ flexGrow: 1 }}>
          <TextField
            multiline
            minRows={2}
            maxRows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />
          
          {previewUrl && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                component="img"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
                src={previewUrl}
                alt="Post preview"
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
                onClick={handleRemoveImage}
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </Box>
          )}
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <label htmlFor="post-image-upload">
              <input
                id="post-image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <IconButton component="span" color="primary">
                <InsertPhotoIcon />
              </IconButton>
            </label>
            
            <Button
              variant="contained"
              disabled={(!content.trim() && !image) || isPending}
              onClick={handleSubmit}
            >
              Post
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export default PostForm;