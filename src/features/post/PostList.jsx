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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Displays a list of posts.
 * If `userId` prop is provided, fetches and displays posts for that user.
 * Otherwise, fetches and displays the main feed posts.
 */
function PostList({ userId }) {
  const isUserProfileFeed = !!userId;

  const storeState = useAppStore((state) => ({
    mainFeedPosts: state.posts,
    isLoadingMainFeed: state.isLoadingPosts,
    mainFeedError: state.postsError,
    userPostsData: state.userPosts[userId],
    currentUser: state.currentUser,
    fetchPosts: state.fetchPosts,
    fetchUserPosts: state.fetchUserPosts,
    deletePost: state.deletePost,
    reactToPost: state.reactToPost,
  }));

  const {
    currentUser,
    fetchPosts,
    fetchUserPosts,
    deletePost,
    reactToPost
  } = storeState;

  const postsToDisplay = isUserProfileFeed
    ? storeState.userPostsData?.list ?? []
    : storeState.mainFeedPosts;
  const isLoading = isUserProfileFeed
    ? storeState.userPostsData?.isLoading ?? true
    : storeState.isLoadingMainFeed;
  const error = isUserProfileFeed
    ? storeState.userPostsData?.error
    : storeState.mainFeedError;

  const [deletingPostId, setDeletingPostId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    if (isUserProfileFeed) {
       if (userId && (!storeState.userPostsData || storeState.userPostsData.list === undefined)) {
           fetchUserPosts(userId);
       }
    } else {
      fetchPosts();
    }
  }, [isUserProfileFeed, userId, fetchUserPosts, fetchPosts, storeState.userPostsData]);

  const handleReaction = async (postId, emoji) => {
    await reactToPost(postId, emoji);
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
        <span className="ml-3 text-muted-foreground">Loading posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Posts</AlertTitle>
          <AlertDescription>
              {error || "Could not fetch posts. Please try again later."}
          </AlertDescription>
      </Alert>
    );
  }

  if (!isLoading && postsToDisplay.length === 0) {
    return (
      <Card className="mt-4 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8 text-sm">
             {isUserProfileFeed ? "This user hasn't posted anything yet." : "No posts found in your feed."}
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
        const likeCount = post.reactions?.filter(r => r.emoji === 'like').length || 0;
        const commentCount = post.commentCount ?? 0;
        const isPostAuthor = currentUser?._id === post.author._id;

        return (
          <Card key={post._id} className={cn("overflow-hidden shadow-sm", isCurrentlyDeleting && "opacity-50 pointer-events-none")}>
            <CardHeader className="p-0">
               <div className="flex items-center justify-between p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                     <Link to={`/user/${post.author._id}`} className="flex-shrink-0">
                       <Avatar className="h-10 w-10 border">
                          <AvatarImage src={post.author.avatarUrl || ''} alt={post.author.name} />
                          <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                       </Avatar>
                     </Link>
                     <div className="ml-0">
                       <Link to={`/user/${post.author._id}`} className="text-sm font-semibold hover:underline">
                          {post.author.name}
                       </Link>
                       <p className="text-xs text-muted-foreground">
                         {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                       </p>
                     </div>
                  </div>
                  {isPostAuthor && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={isCurrentlyDeleting}>
                          {isCurrentlyDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                          <span className="sr-only">Post options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteClick(post._id)} className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer text-sm p-2" disabled={isCurrentlyDeleting}>
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Post</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
               </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-2 pt-0">
              {post.content && (
                <p className="text-sm whitespace-pre-wrap mb-3">
                  {post.content}
                </p>
              )}
              {post.image && (
                <div className="mt-2 rounded-md overflow-hidden border bg-muted">
                  <img src={post.image} alt="Post attachment" className="max-h-[600px] w-full object-contain aspect-auto" />
                </div>
              )}
            </CardContent>
             <CardFooter className="px-3 sm:px-4 py-1.5 bg-muted/30 border-t">
               <div className="flex items-center justify-start gap-1 w-full text-xs text-muted-foreground">
                 <Button variant="ghost" size="sm" onClick={() => handleReaction(post._id, 'like')} className={cn("flex items-center gap-1 hover:text-primary px-1.5 h-7 text-xs", isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground')}>
                   <Heart className={cn("h-4 w-4", isLikedByCurrentUser && 'fill-primary')} />
                   <span>{likeCount}</span>
                   <span className="sr-only">Likes</span>
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => toggleComments(post._id)} className={cn("flex items-center gap-1 text-muted-foreground hover:text-primary px-1.5 h-7 text-xs", areCommentsExpanded && 'text-primary bg-muted')} aria-expanded={areCommentsExpanded}>
                   <MessageSquare className="h-4 w-4" />
                   <span>{commentCount}</span>
                   <span className="sr-only">Comments</span>
                 </Button>
               </div>
             </CardFooter>
             {areCommentsExpanded && (
               <div className="px-3 sm:px-4 py-2 border-t border-border/50 bg-muted/20">
                 <CommentList postId={post._id} />
               </div>
             )}
          </Card>
        );
      })}
      {isLoading && postsToDisplay.length > 0 && (
             <div className="flex justify-center py-4">
               <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
             </div>
       )}
    </div>
  );
}

PostList.propTypes = {
  userId: PropTypes.string,
};

export default PostList;