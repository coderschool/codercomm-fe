import React, { useState } from "react";
import PostCard from "./PostCard";
import { useGetPosts, useGetPostsByUser } from "./postHooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

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
      <Card className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-muted-foreground">Loading posts...</span>
        </div>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Posts
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message}
          </p>
          {userId && (
            <div className="bg-muted p-3 rounded text-xs mb-4">
              <p>Debug info:</p>
              <p>User ID: {userId}</p>
              <p>Endpoint: {`/posts/user/${userId}?page=${page}&limit=5`}</p>
            </div>
          )}
          <Button variant="secondary" onClick={() => setPage(1)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <Card className="p-6">
        <div className="py-8 text-center">
          <p className="text-xl font-semibold mb-2">
            No Posts Yet
          </p>
          <p className="text-muted-foreground">
            {userId ? "This user hasn't posted anything yet." : "Your feed is empty. Follow some users to see their posts."}
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      
      <div className="flex justify-center py-4">
        {page < totalPages ? (
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setPage((page) => page + 1)}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></span>
            ) : (
              "Load more posts"
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