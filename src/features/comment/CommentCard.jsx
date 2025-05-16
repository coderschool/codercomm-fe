import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";

import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/mergeClassName";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommentReactions from "./CommentReaction";
function CommentCard({ comment }) {
  const { _id, author, content, createdAt, updatedAt, reactions } = comment;

  return (
    <div className={cn("flex gap-2 py-1 group")}>
      <Link to={`/user/${comment.author._id}`} className="flex-shrink-0 ">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={author.avatarUrl || ""} alt={author.name} />
          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="-mt-0.5 grow flex flex-col bg-muted rounded-lg relative text-sm px-3 pt-2 pb-3">
        <Link
          to={`/users/${comment.author._id}`}
          className="font-semibold hover:underline"
        >
          {author.name}
        </Link>

        {/* Comment Content */}
        <span className="whitespace-pre-wrap">{content}</span>

        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground text-xs">
          <CommentReactions commentId={_id} commentReactions={reactions} />

          <span>•</span>

          <span>
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* Indicate if edited */}
          {updatedAt && createdAt !== updatedAt && (
            <span className="italic text-muted-foreground/70">(Edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
