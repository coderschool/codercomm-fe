import React from "react";

import CommentCard from "./CommentCard";

import { useComments } from "./CommentStoreProvider";
import { Loader2 } from "lucide-react";

function CommentList() {
  const { comments, isLoading } = useComments();

  if (isLoading || !comments) {
    return (
      <div className="flex justify-center py-4 h-full w-full">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground text-xs py-4">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {comments.map((comment) => (
            <CommentCard key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentList;
