import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Hooks & Utilities
import useAuth from "@/hooks/useAuth";
import { useReactToComment, useDeleteComment } from "@/hooks/useCommentQuery";
import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

// ShadCN Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MoreVertical, Trash2, Loader2 } from "lucide-react";

/**
 * Displays a single comment item with author, content, timestamp, and actions.
 */
function CommentItem({ comment, postId }) {
  const { user: currentUser } = useAuth();
  // Get mutation hooks and their states
  const { mutate: reactToCommentMutate, isPending: isReacting } = useReactToComment();
  const { mutate: deleteCommentMutate, isPending: isDeleting } = useDeleteComment();

  // Handler for liking/unliking a comment
  const handleReaction = () => {
    if (isReacting) return; // Prevent multiple clicks
    reactToCommentMutate({ 
        commentId: comment._id, 
        emoji: 'like',
        postId: postId // Pass postId for invalidation
    });
  };

  // Handler for deleting a comment
  const handleDeleteClick = () => {
    if (isDeleting) return; // Prevent multiple clicks
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutate(comment._id, { 
          // Pass postId in the second argument (variables) for onSuccess callback
          postId: postId 
      });
    }
  };
  
  // Check if the current user has liked this comment
  const isLikedByCurrentUser = comment.reactions?.some(
      r => r.author._id === currentUser?._id && r.emoji === 'like'
  );
  // Check if this comment belongs to the current user
  const isCommentAuthor = currentUser?._id === comment.author._id;

  return (
    <div className="flex gap-3 py-2">
      {/* Author Avatar */}
      <Link to={`/user/${comment.author._id}`} className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={comment.author.avatarUrl || ''} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      
      {/* Comment Body and Actions */}
      <div className="flex-1 group">
        <div className="bg-muted px-3 py-2 rounded-lg relative">
          {/* Delete Menu (only for author) */}
          {isCommentAuthor && (
            <div className="absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                         <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <MoreVertical className="h-3 w-3" />
                    )}
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Add Edit later */} 
                  <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive text-xs flex items-center gap-2 cursor-pointer"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Author Name */}
          <Link 
            to={`/user/${comment.author._id}`}
            className="text-xs font-semibold hover:underline"
          >
            {comment.author.name}
          </Link>
          
          {/* Comment Content */}
          <p className="text-sm whitespace-pre-wrap mt-1">{comment.content}</p>
        </div>
        
        {/* Actions (Like, Timestamp) */}
        <div className="flex items-center gap-2 mt-1 px-1 text-xs text-muted-foreground">
          <Button 
            variant="ghost" 
            size="xs" // Custom size potentially needed or use padding
            onClick={handleReaction}
            disabled={isReacting}
            className={cn(
                "flex items-center gap-0.5 h-auto p-0 hover:text-primary", 
                isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Heart className={cn("h-3 w-3", isLikedByCurrentUser && 'fill-primary')} />
            <span className="ml-0.5">{comment.reactions?.filter(r => r.emoji === 'like').length || 0}</span>
            <span className="sr-only">Likes</span>
          </Button>
          
          <span>•</span>
          
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          
          {/* Indicate if edited */}
          {comment.updatedAt && comment.createdAt !== comment.updatedAt && (
            <> 
              <span>•</span> 
              <span>Edited</span>
            </>
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
  postId: PropTypes.string.isRequired, // Need postId for invalidation/mutation
};

export default CommentItem; 