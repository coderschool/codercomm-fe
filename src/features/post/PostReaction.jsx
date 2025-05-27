import React from "react";

import { Button } from "@/components/ui/button";
import { usePostAction } from "./PostStoreProvider";
import { useAuthState } from "@/lib/auth/useAuth";
import { cn } from "@/utils/merge-class-name";
import { REACTION_EMOJIS } from "@/lib/config";
import {
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "@/components/ui/tooltip";

function PostReactions({ postId, postReactions = [] }) {
  const { reactToPost } = usePostAction();
  const { currentUser } = useAuthState();

  const reactions = Object.groupBy(postReactions, ({ emoji }) => emoji);

  const myReaction = postReactions.find(
    (r) => r.author._id === currentUser._id
  );

  return (
    <div className="flex items-center">
      {REACTION_EMOJIS.map((reaction) => {
        const reactionCount = reactions[reaction.emoji]?.length || 0;
        return (
          <TooltipProvider key={reaction.emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="icon"
                  key={reaction.emoji}
                  size="sm"
                  className={cn(
                    `flex items-center gap-1 border border-transparent group`,
                    reaction.textColor,
                    myReaction?.emoji === reaction.emoji && reaction.borderColor
                  )}
                  onClick={() => reactToPost(postId, reaction.emoji)}
                >
                  <reaction.icon
                    className={`${reaction.textColor} group-hover:scale-125`}
                  />
                  <span className="font-semibold group-hover:scale-125">
                    {reactionCount}
                  </span>
                </Button>
              </TooltipTrigger>
              {reactionCount > 0 && (
                <TooltipContent>
                  <div className="flex flex-col items-start">
                    {reactions[reaction.emoji].slice(0, 3).map((r) => (
                      <span key={r._id} className="text-xs truncate">
                        {r.author.name}
                      </span>
                    ))}
                    {reactionCount > 3 && (
                      <span className="text-xs truncate">
                        + {reactionCount - 3} more
                      </span>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

export default PostReactions;
