import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";

// Hooks & Utilities
import { useAppStore } from "@/features/use-app-store";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/mergeClassName";

// ShadCN Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

/**
 * Displays a single comment item with author, content, timestamp, and actions.
 */
function CommentItem({ comment }) {
  // Select user and actions from store
  const { currentUser, reactToComment } = useAppStore();

  const [isReacting, setIsReacting] = React.useState(false);

  // Handler for liking/unliking a comment
  const handleReaction = async () => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      await reactToComment(comment._id, "like");
    } finally {
      setIsReacting(false);
    }
  };

  // Check if the current user has liked this comment
  const isLikedByCurrentUser = comment.reactions?.some(
    (r) => r.author._id === currentUser?._id && r.emoji === "like"
  );
  // Check if this comment belongs to the current user
  // const isCommentAuthor = currentUser?._id === comment.author._id;
  const likeCount =
    comment.reactions?.filter((r) => r.emoji === "like").length || 0;

  return (
    <div className={cn("flex gap-2 py-1 group")}>
      {/* Author Avatar */}
      <Link to={`/user/${comment.author._id}`} className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8 border">
          <AvatarImage
            src={comment.author.avatarUrl || ""}
            alt={comment.author.name}
          />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>

      {/* Comment Body and Actions */}
      <div className="flex-1">
        <div className="bg-muted px-3 py-1.5 rounded-lg relative text-sm">
          {/* Author Name */}
          <Link
            to={`/user/${comment.author._id}`}
            className="text-xs font-semibold hover:underline mr-1.5"
          >
            {comment.author.name}
          </Link>

          {/* Comment Content */}
          <span className="whitespace-pre-wrap">{comment.content}</span>
        </div>

        {/* Actions (Like, Timestamp) */}
        <div className="flex items-center gap-1.5 mt-0.5 px-1 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="xs" // Custom size potentially needed or use padding
            onClick={handleReaction}
            disabled={isReacting}
            className={cn(
              "flex items-center gap-0.5 h-auto p-0 hover:text-primary",
              isLikedByCurrentUser ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Heart
              className={cn("h-3 w-3", isLikedByCurrentUser && "fill-primary")}
            />
            <span className="ml-0.5">{likeCount}</span>
            <span className="sr-only">Likes</span>
          </Button>

          <span>•</span>

          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* Indicate if edited */}
          {comment.updatedAt && comment.createdAt !== comment.updatedAt && (
            <span className="italic text-muted-foreground/70">(Edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.object.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    reactions: PropTypes.array,
  }).isRequired,
};

export default CommentItem;
