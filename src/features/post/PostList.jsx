import React, { useState } from "react";
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
import useAuth from "@/hooks/useAuth";
import { useReactToPost, useDeletePost } from "@/hooks/usePostQuery";
import { cn } from "@/lib/utils";
import { useGetPosts, useGetPostsByUser } from "./postHooks";
import CommentList from "@/features/comment/CommentList";

/**
 * Displays a list of posts with interaction buttons (like, comment, delete).
 */
function PostList({ posts = [], userId }) {
  const { user: currentUser } = useAuth();
  const { mutate: reactToPostMutate, isPending: isReacting } = useReactToPost();
  const { mutate: deletePostMutate, isPending: isDeleting } = useDeletePost();
  const [page, setPage] = useState(1);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  
  // Choose the right query based on whether userId is provided
  const query = userId
    ? useGetPostsByUser(userId, page)
    : useGetPosts(page);
  
  const { data, isLoading, error } = query;
  
  // Extract posts and total pages from the data
  const { posts: queryPosts, totalPages } = data || { posts: [], totalPages: 0 };
  
  const handleReaction = (postId, emoji) => {
    // Prevent reacting while another reaction is in progress (optional)
    // if (isReacting) return;
    reactToPostMutate({ postId, emoji });
  };

  const handleDeleteClick = (postId) => {
    if (isDeleting) return; // Prevent multiple delete clicks
    if (window.confirm("Are you sure you want to delete this post?")) {
      setDeletingPostId(postId); // Set which post is being deleted
      deletePostMutate(postId, {
          onSettled: () => setDeletingPostId(null) // Clear deleting state regardless of success/error
      });
    }
  };

  // Function to toggle comment visibility for a specific post
  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Loading state
  if (isLoading && page === 1) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-muted-foreground">Loading posts...</span>
        </div>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Posts
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message}
          </p>
          {userId && (
            <div className="bg-muted p-3 rounded text-xs mb-4">
              <p>Debug info:</p>
              <p>User ID: {userId}</p>
              <p>Endpoint: {`/posts/user/${userId}?page=${page}&limit=5`}</p>
            </div>
          )}
          <Button variant="secondary" onClick={() => setPage(1)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!queryPosts || queryPosts.length === 0) {
    return (
      <Card className="p-6">
        <div className="py-8 text-center">
          <p className="text-xl font-semibold mb-2">
            No Posts Yet
          </p>
          <p className="text-muted-foreground">
            {userId ? "This user hasn't posted anything yet." : "Your feed is empty. Follow some users to see their posts."}
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {queryPosts.map((post) => {
        // Determine if the current user liked this post
        const isLikedByCurrentUser = post.reactions?.some(
          (reaction) => reaction.author._id === currentUser?._id && reaction.emoji === 'like'
        );
        // Check if this specific post is being deleted
        const isCurrentlyDeleting = isDeleting && deletingPostId === post._id;
        // Check if comments are expanded for this post
        const areCommentsExpanded = !!expandedComments[post._id];

        return (
          <Card key={post._id} className={cn("overflow-hidden shadow-sm", isCurrentlyDeleting && "opacity-50 pointer-events-none")}>
            <CardHeader className="p-0">
              {/* Post Author Info & Delete Menu */}
              <div className="flex items-center justify-between p-4">
                {/* Author Info */}
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
                      {/* Format date using date-fns */}
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {/* Post Menu Dropdown (only for post author) */}
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
                      {/* Add Edit option later */}
                      {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
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
              {/* Post Content */}
              {post.content && (
                <p className="text-sm whitespace-pre-wrap mb-3">
                  {post.content}
                </p>
              )}
              
              {/* Post Image (if exists) */}
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
              {/* Post Actions/Stats */}
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {/* Like Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleReaction(post._id, 'like')}
                    disabled={isReacting}
                    className={cn(
                      "flex items-center gap-1 hover:text-primary px-2",
                      isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isLikedByCurrentUser && 'fill-primary')} />
                    {/* Display optimistic count or actual count */}
                    <span>{post.reactions?.filter(r => r.emoji === 'like').length || 0}</span> 
                    <span className="sr-only">Likes</span>
                  </Button>
                  {/* Comment Button - Now toggles comment visibility */}
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
                {/* Add Share button/count later */}
              </div>
            </CardFooter>

            {/* Conditionally render CommentList based on expanded state */} 
            {areCommentsExpanded && (
              <div className="p-4 pt-2 border-t border-border/50">
                <CommentList postId={post._id} />
              </div>
            )}
          </Card>
        );
      })}
      
      <div className="flex justify-center py-4">
        {page < totalPages ? (
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setPage((page) => page + 1)}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></span>
            ) : (
              "Load more posts"
            )}
          </Button>
        ) : (
          posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No more posts to load
            </p>
          )
        )}
      </div>
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
    reactions: PropTypes.array, // Array of reaction objects
    commentCount: PropTypes.number, 
  })),
};

export default PostList;