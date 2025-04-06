import React from "react";
import PropTypes from 'prop-types';
import { useCommentsQuery } from "@/hooks/useCommentQuery";
import { Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Displays a list of comments for a post and includes the comment input form.
 */
function CommentList({ postId }) {
  const { 
    data: comments, // Renamed data to comments
    isLoading,
    isError,
    error 
  } = useCommentsQuery(postId); // Fetch comments for this post

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      {/* Form to add a new comment */}
      <CommentForm postId={postId} />
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs">
                {error?.message || "Could not load comments."}
            </AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      {!isLoading && !isError && (
        <> 
          {comments?.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No comments yet. Be the first!
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {comments?.map(comment => (
                <CommentItem key={comment._id} comment={comment} postId={postId} />
              ))}
              {/* Add pagination / "Load More" button here later if needed */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

CommentList.propTypes = {
  postId: PropTypes.string.isRequired,
};

export default CommentList;