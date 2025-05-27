import React from "react";

import CommentCard from "./CommentCard";

import { useCommentAction, useCommentState } from "./CommentStoreProvider";
import { Loader2 } from "lucide-react";

function CommentList() {
  const { comments, isLoading, cursorCommentId, hasMore } = useCommentState();
  const { fetchComments } = useCommentAction();

  if (!isLoading && comments.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-xs py-4">
        No comments yet. Be the first!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentCard key={comment._id} comment={comment} />
      ))}

      {hasMore && !isLoading && (
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary"
          onClick={() => fetchComments(cursorCommentId)}
        >
          Load older comments
        </button>
      )}
      {isLoading && (
        <div className="flex justify-center py-4 h-full w-full">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

export default CommentList;
