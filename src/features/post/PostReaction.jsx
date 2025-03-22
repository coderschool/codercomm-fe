import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactPost } from "./postHooks";

function PostReaction({ post }) {
  const reactPostMutation = useReactPost();

  const handleClick = (emoji) => {
    reactPostMutation.mutate({ postId: post._id, emoji });
  };

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-primary" 
        onClick={() => handleClick("like")}
        disabled={reactPostMutation.isPending}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="font-semibold">{post?.reactions?.like}</span>
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-destructive" 
        onClick={() => handleClick("dislike")}
        disabled={reactPostMutation.isPending}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="font-semibold">{post?.reactions?.dislike}</span>
      </Button>
    </div>
  );
}

export default PostReaction;