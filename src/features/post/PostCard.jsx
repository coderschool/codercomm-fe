import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, ThumbsUp, ThumbsDown, MessageCircle, Share } from 'lucide-react';

import { useReactPost } from './postHooks';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/formatters';
import CommentList from '../comment/CommentList';
import CommentForm from '../comment/CommentForm';

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DEFAULT_AVATAR } from '../../lib/config';

function PostCard({ post }) {
  const { user } = useAuth();
  const { mutate: reactPost } = useReactPost();
  
  const [showComments, setShowComments] = useState(false);
  
  // Handle reaction
  const handleReact = (emoji) => {
    reactPost({ postId: post._id, emoji });
  };
  
  // Check if user has reacted to this post
  const isLiked = post?.reactions?.some(
    (reaction) => reaction.emoji === 'like' && reaction.author._id === user?._id
  );
  
  const isDisliked = post?.reactions?.some(
    (reaction) => reaction.emoji === 'dislike' && reaction.author._id === user?._id
  );
  
  // Count reactions
  const likesCount = post?.reactions?.filter((reaction) => reaction.emoji === 'like').length || 0;
  const dislikesCount = post?.reactions?.filter((reaction) => reaction.emoji === 'dislike').length || 0;
  
  // Check if post belongs to the current user
  const isPostAuthor = post?.author?._id === user?._id;
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U';
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={post?.author?.avatarUrl || DEFAULT_AVATAR} 
            alt={post?.author?.name} 
          />
          <AvatarFallback>{getInitials(post?.author?.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <Link 
            to={`/user/${post?.author?._id}`}
            className="font-semibold hover:underline"
          >
            {post?.author?.name}
          </Link>
          <span className="text-xs text-muted-foreground">{formatDate(post?.createdAt)}</span>
        </div>
        
        {isPostAuthor && (
          <Button variant="ghost" size="icon" className="ml-auto" aria-label="More options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="mb-4">{post?.content}</p>
        
        {post?.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            <img
              src={post.image}
              alt="Post attachment"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              className={isLiked ? "text-primary" : ""}
              onClick={() => handleReact('like')}
            >
              <ThumbsUp className="mr-1 h-4 w-4" />
              <span>{likesCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className={isDisliked ? "text-primary" : ""}
              onClick={() => handleReact('dislike')}
            >
              <ThumbsDown className="mr-1 h-4 w-4" />
              <span>{dislikesCount}</span>
            </Button>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="mr-1 h-4 w-4" />
          <span>{post?.commentCount || 0}</span>
        </Button>
      </CardFooter>
      
      {showComments && (
        <div className="border-t p-4">
          <CommentForm postId={post?._id} />
          <CommentList postId={post?._id} />
        </div>
      )}
    </Card>
  );
}

export default PostCard;