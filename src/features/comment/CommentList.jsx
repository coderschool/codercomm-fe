import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useAppStore } from "@/features/use-app-store";
import { Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Displays a list of comments for a post and includes the comment input form.
 */
function CommentList({ postId }) {
  // Select the specific comment state and fetch act  ion for this postId
  const { comments, fetchComments } = useAppStore();
  const commentsData = comments[postId];
  // Fetch comments when the component mounts or postId changes
  useEffect(() => {
    if (postId) {
      fetchComments(postId); // Fetch first page by default
    }
    // No cleanup needed here as the fetch action handles its own state
  }, [postId]);

  // Extract state, providing defaults
  const commentsList = commentsData?.list ?? [];
  const isLoading = commentsData?.isLoading ?? false;
  const error = commentsData?.error ?? null;
  const isInitialLoad = commentsData === undefined && !error; // Check if state exists yet

  return (
    <div className="mt-4 pt-4">
      {/* Loading State */}
      {(isLoading || isInitialLoad) && commentsList.length === 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-xs">
            {error || "Could not load comments."}
          </AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      {!isInitialLoad && !error && (
        <>
          {commentsList.length === 0 && !isLoading ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No comments yet. Be the first!
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {commentsList.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={postId}
                />
              ))}
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
