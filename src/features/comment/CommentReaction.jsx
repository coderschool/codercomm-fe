import React from "react";
import { Button } from "@/components/ui/button";
import { useComment } from "./CommentStoreProvider";
import { REACTION_EMOJIS } from "@/lib/config";
import { useAuth } from "@/lib/auth/useAuth";
import { cn } from "@/utils/merge-class-name";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
function CommentReactions({ commentId, commentReactions = [] }) {
  const { reactToComment } = useComment((state) => state.actions);
  const currentUser = useAuth((state) => state.currentUser);

  const reactions = Object.groupBy(commentReactions, ({ emoji }) => emoji);

  const myReaction = commentReactions.find(
    (r) => r.author._id === currentUser._id
  );

  const myEmoji = REACTION_EMOJIS.find((r) => r.emoji === myReaction?.emoji);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {myEmoji ? (
            <myEmoji.icon
              size={14}
              className={`cursor-pointer ${myEmoji.textColor}`}
              onClick={() => reactToComment(commentId, myReaction.emoji)}
            />
          ) : (
            <button
              className="text-muted-foreground hover:underline"
              type="button"
              onClick={() => reactToComment(commentId, "LIKE")}
            >
              Like
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <div className="flex items-center">
            {REACTION_EMOJIS.map((reaction) => (
              <Button
                variant="icon"
                key={reaction.emoji}
                size="sm"
                className={cn(
                  `flex items-center gap-1 border border-transparent hover:scale-125`,
                  reaction.textColor,
                  myReaction?.emoji === reaction.emoji && reaction.borderColor
                )}
                onClick={() => reactToComment(commentId, reaction.emoji)}
              >
                <reaction.icon className={reaction.textColor} />
                <span className="font-semibold">
                  {reactions[reaction.emoji]?.length || 0}
                </span>
              </Button>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default CommentReactions;
