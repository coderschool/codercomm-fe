import React, { useState } from "react";
import PostCard from "./PostCard";
import { useGetPosts, useGetPostsByUser } from "./postHooks";
import { Button } from "@/components/ui/button";

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
  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <p className="text-xl font-semibold text-destructive text-center">
        {error.message}
      </p>
    );
  }
  
  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-xl font-semibold text-center">
          No Posts Yet
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      
      <div className="flex justify-center">
        {page < totalPages ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => setPage((page) => page + 1)}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></span>
            ) : (
              "Load more"
            )}
          </Button>
        ) : (
          posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No more posts to load
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default PostList;