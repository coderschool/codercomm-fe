import React, { useState } from "react";
import { Link as RouterLink } from "react-router";
import { formatTimeAgo } from "@/lib/formatTime";
import { MoreVertical } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import PostReaction from "./PostReaction";
import CommentForm from "@/features/comment/CommentForm";
import CommentList from "@/features/comment/CommentList";
import { CommentStoreProvider } from "../comment/CommentStoreProvider";

function PostCard({ post }) {
  const { author, _id, content, image, createdAt, reactions } = post;
  const [showingComments, setShowingComments] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start space-y-0 gap-3 pb-3">
        <Avatar>
          <AvatarImage src={author.avatarUrl} alt={author.name} />
          <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <RouterLink
            to={`/users/${author._id}`}
            className="font-semibold text-foreground hover:underline"
          >
            {author.name}
          </RouterLink>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(createdAt)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p>{content}</p>

        {post.image && (
          <div className="rounded-md overflow-hidden h-[400px]">
            <img
              src={image}
              alt="post"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <PostReaction postId={_id} postReactions={reactions} />

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => setShowingComments(!showingComments)}
          >
            {`${post.commentCount} comments`}
          </Button>
        </div>

        {showingComments && (
          <div className="w-full grow flex flex-col gap-6 mt-4">
            <Separator />
            <CommentStoreProvider postId={_id}>
              <CommentList />
              <CommentForm />
            </CommentStoreProvider>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default PostCard;
