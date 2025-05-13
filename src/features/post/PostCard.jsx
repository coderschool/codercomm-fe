import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router";
import { formatTimeAgo } from "@/lib/formatTime";
import { MoreVertical } from "lucide-react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import PostReaction from "./PostReaction";
import CommentForm from "@/features/comment/CommentForm";
import CommentList from "@/features/comment/CommentList";

/**
 * Post card component that displays a single post with author info, content, and comments
 * @param {Object} props - Component props
 * @param {Object} props.post - Post data
 */
function PostCard({ post }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start space-y-0 gap-3 pb-3">
        <Avatar>
          <AvatarImage src={post?.author?.avatarUrl} alt={post?.author?.name} />
          <AvatarFallback>{post?.author?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <RouterLink
            to={`/users/${post.author._id}`}
            className="font-semibold text-foreground hover:underline"
          >
            {post?.author?.name}
          </RouterLink>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(post.createdAt)}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">More</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <p>{post.content}</p>

        {post.image && (
          <div className="rounded-md overflow-hidden h-[300px]">
            <img
              src={post.image}
              alt="post"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <PostReaction post={post} />

        <Separator />

        {/* <CommentList postId={post._id} /> */}
        <CommentForm postId={post._id} />
      </CardContent>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    image: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default PostCard;
