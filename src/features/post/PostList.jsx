import React from "react";

import { Card, CardContent } from "@/components/ui/card";

import { usePostState } from "./PostStoreProvider";
import PostCard from "./PostCard";
import { Loader2 } from "lucide-react";

function PostList() {
  const { posts, isLoading } = usePostState();

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
      {isLoading && (
        <div className="flex justify-center py-4 h-full w-full">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

export default PostList;
