import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

function PostReaction({ post }) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-primary"
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="font-semibold">{post?.reactions?.like}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-destructive"
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="font-semibold">{post?.reactions?.dislike}</span>
      </Button>
    </div>
  );
}

export default PostReaction;
