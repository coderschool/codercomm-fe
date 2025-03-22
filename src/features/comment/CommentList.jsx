import React, { useState } from "react";
import { useGetComments } from "./commentHooks";
import CommentCard from "./CommentCard";
import { COMMENTS_PER_POST } from "@/lib/config";

function CommentList({ postId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetComments(postId, page);
  
  const comments = data?.comments || [];
  const totalComments = data?.totalComments || 0;
  const totalPages = Math.ceil(totalComments / COMMENTS_PER_POST);

  let renderComments;

  if (isLoading) {
    renderComments = (
      <div className="flex justify-center py-4">
        <div className="animate-pulse h-6 w-6 rounded-full bg-muted"></div>
      </div>
    );
  } else if (comments.length > 0) {
    renderComments = (
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard key={comment._id} comment={comment} />
        ))}
      </div>
    );
  } else {
    renderComments = null;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {totalComments > 1
            ? `${totalComments} comments`
            : totalComments === 1
            ? `${totalComments} comment`
            : "No comment"}
        </p>
        {totalComments > COMMENTS_PER_POST && (
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`h-7 w-7 rounded-md text-xs ${
                  page === pageNum 
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
      {renderComments}
    </div>
  );
}

export default CommentList;