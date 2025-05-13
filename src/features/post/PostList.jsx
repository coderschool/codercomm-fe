import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Card, CardContent } from "@/components/ui/card";

import { usePost } from "./postSlice";
import PostCard from "./PostCard";

/**
 * Displays a list of posts.
 * If `userId` prop is provided, fetches and displays posts for that user.
 * Otherwise, fetches and displays the main feed posts.
 */
function PostList() {
  const { posts, isLoading } = usePost();

  if (!isLoading && posts.length === 0) {
    return (
      <Card className="mt-4 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8 text-sm">
            {"No posts founded."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        return <PostCard post={post} key={post._id} />;
      })}
    </div>
  );
}

PostList.propTypes = {
  userId: PropTypes.string,
};

export default PostList;
