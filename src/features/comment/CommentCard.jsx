import React from "react";
import PropTypes from "prop-types";
import { formatTimeAgo } from "@/utils/formatTime";
import CommentReaction from "./CommentReaction";

import { 
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

/**
 * Comment card component that displays a single comment with author info
 * @param {Object} props - Component props
 * @param {Object} props.comment - Comment data
 */
function CommentCard({ comment }) {
  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage alt={comment.author?.name} src={comment.author?.avatarUrl} />
        <AvatarFallback>{comment.author?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <Card className="flex-1 p-3 bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
          <p className="font-semibold text-sm">{comment.author?.name}</p>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</p>
        </div>
        
        <p className="text-sm text-foreground/80">{comment.content}</p>
        
        <div className="flex justify-end mt-2">
          <CommentReaction comment={comment} />
        </div>
      </Card>
    </div>
  );
}

CommentCard.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default CommentCard;