import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getInitials } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from '@/lib/store';
import { cn } from "@/lib/utils";
import CommentList from "@/features/comment/CommentList";

/**
 * Displays a list of posts.
 * If `posts` prop is provided, displays those posts.
 * Otherwise, fetches and displays all posts from the Zustand store.
 * Handles interactions like delete and react via store actions.
 */
function PostList({ posts: postsProp }) {
  const {
    storePosts,
    isLoadingStorePosts,
    storePostsError,
    fetchPosts,
    deletePost,
    reactToPost,
    currentUser,
  } = useAppStore((state) => ({
    storePosts: state.posts,
    isLoadingStorePosts: state.isLoadingPosts,
    storePostsError: state.postsError,
    fetchPosts: state.fetchPosts,
    deletePost: state.deletePost,
    reactToPost: state.reactToPost,
    currentUser: state.currentUser,
  }), (left, right) => {
    return left.isLoadingStorePosts === right.isLoadingStorePosts &&
           left.storePostsError === right.storePostsError &&
           left.currentUser === right.currentUser &&
           (postsProp || (left.storePosts.length === right.storePosts.length && left.storePosts.every((post, i) => post._id === right.storePosts[i]?._id)));
  });

  const [deletingPostId, setDeletingPostId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  
  const shouldFetchInternally = postsProp === undefined;

  useEffect(() => {
    if (shouldFetchInternally) {
      fetchPosts();
    }
  }, [shouldFetchInternally, fetchPosts]);

  const postsToDisplay = postsProp !== undefined ? postsProp : storePosts;
  const isLoading = postsProp !== undefined ? false : isLoadingStorePosts;
  const error = postsProp !== undefined ? null : storePostsError;

  const handleReaction = (postId, emoji) => {
    reactToPost(postId, emoji);
  };

  const handleDeleteClick = async (postId) => {
    if (deletingPostId) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      setDeletingPostId(postId);
      try {
        await deletePost(postId);
      } catch (error) {
        console.error("Delete failed in component:", error);
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (isLoading && postsToDisplay.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="mt-4 shadow-sm border-destructive bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-center text-destructive py-8">
            Error loading posts: {error}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!isLoading && postsToDisplay.length === 0) {
    return (
      <Card className="mt-4 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            No posts to display yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {postsToDisplay.map((post) => {
        const isLikedByCurrentUser = post.reactions?.some(
          (reaction) => reaction.author._id === currentUser?._id && reaction.emoji === 'like'
        );
        const isCurrentlyDeleting = deletingPostId === post._id;
        const areCommentsExpanded = !!expandedComments[post._id];

        return (
          <Card key={post._id} className={cn("overflow-hidden shadow-sm", isCurrentlyDeleting && "opacity-50 pointer-events-none")}>
            <CardHeader className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Link to={`/user/${post.author._id}`} className="flex-shrink-0">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={post.author.avatarUrl || ''} alt={post.author.name} />
                      <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="ml-0">
                    <Link 
                      to={`/user/${post.author._id}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {post.author.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {currentUser?._id === post.author._id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isCurrentlyDeleting}>
                        {isCurrentlyDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                        <span className="sr-only">Post options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(post._id)}
                        className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                        disabled={isCurrentlyDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="px-4 pb-2 pt-0">
              {post.content && (
                <p className="text-sm whitespace-pre-wrap mb-3">
                  {post.content}
                </p>
              )}
              
              {post.image && (
                <div className="mt-2 -mx-4 sm:mx-0 rounded-md overflow-hidden border">
                  <img 
                    src={post.image} 
                    alt="Post attachment" 
                    className="max-h-[500px] w-full object-cover aspect-video" 
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="px-4 py-2 bg-muted/50 border-t">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleReaction(post._id, 'like')}
                    className={cn(
                      "flex items-center gap-1 hover:text-primary px-2",
                      isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isLikedByCurrentUser && 'fill-primary')} />
                    <span>{post.reactions?.filter(r => r.emoji === 'like').length || 0}</span> 
                    <span className="sr-only">Likes</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleComments(post._id)}
                    className={cn(
                      "flex items-center gap-1 text-muted-foreground hover:text-primary px-2",
                      areCommentsExpanded && 'text-primary'
                    )}
                    aria-expanded={areCommentsExpanded}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentCount || 0}</span>
                    <span className="sr-only">Comments</span>
                  </Button>
                </div>
              </div>
            </CardFooter>

            {areCommentsExpanded && (
              <div className="p-4 pt-2 border-t border-border/50">
                <CommentList postId={post._id} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }).isRequired,
    reactions: PropTypes.array,
    commentCount: PropTypes.number,
  })),
};

export default PostList;