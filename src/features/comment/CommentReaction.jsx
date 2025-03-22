import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactComment } from "./commentHooks";

function CommentReaction({ comment }) {
  const reactCommentMutation = useReactComment();

  const handleClick = (emoji) => {
    reactCommentMutation.mutate({ commentId: comment._id, emoji });
  };

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-primary h-7 px-2" 
        onClick={() => handleClick("like")}
        disabled={reactCommentMutation.isPending}
      >
        <ThumbsUp className="h-3 w-3" />
        <span className="text-xs">{comment?.reactions?.like}</span>
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-destructive h-7 px-2" 
        onClick={() => handleClick("dislike")}
        disabled={reactCommentMutation.isPending}
      >
        <ThumbsDown className="h-3 w-3" />
        <span className="text-xs">{comment?.reactions?.dislike}</span>
      </Button>
    </div>
  );
}

export default CommentReaction;