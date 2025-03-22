import { LoadingButton } from "@mui/lab";
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import PostCard from "./PostCard";
import { useGetPosts, useGetPostsByUser } from "./postHooks";
import LoadingScreen from "../../components/LoadingScreen";

function PostList({ userId }) {
  const [page, setPage] = useState(1);
  
  // Choose the right query based on whether userId is provided
  const query = userId
    ? useGetPostsByUser(userId, page)
    : useGetPosts(page);
  
  const { data, isLoading, error } = query;
  
  // Extract posts and total pages from the data
  const { posts, totalPages } = data || { posts: [], totalPages: 0 };
  
  // Loading state
  if (isLoading && page === 1) return <LoadingScreen />;
  
  // Error state
  if (error) {
    return (
      <Typography variant="h6" color="error" textAlign="center">
        {error.message}
      </Typography>
    );
  }
  
  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" textAlign="center">
          No Posts Yet
        </Typography>
      </Box>
    );
  }
  
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {page < totalPages ? (
          <LoadingButton
            variant="outlined"
            size="small"
            loading={isLoading}
            onClick={() => setPage((page) => page + 1)}
          >
            Load more
          </LoadingButton>
        ) : (
          posts.length > 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No more posts to load
            </Typography>
          )
        )}
      </Box>
    </>
  );
}

export default PostList;