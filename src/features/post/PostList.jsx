import React from "react";

import { Card, CardContent } from "@/components/ui/card";

import { usePosts } from "./postStore";
import PostCard from "./PostCard";

function PostList() {
  const { posts, isLoading } = usePosts();

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

export default PostList;
