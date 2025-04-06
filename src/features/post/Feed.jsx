import React, { useEffect, useRef } from "react";
import { usePostsQuery } from "@/hooks/usePostQuery"; // Import the infinite query hook
import PostList from "./PostList"; // The component to render posts
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer"; // Hook for detecting visibility
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Feed Component:
 * - Fetches feed posts using usePostsQuery (infinite query).
 * - Implements infinite scrolling using react-intersection-observer.
 * - Handles loading and error states.
 */
function Feed() {
  // Use the infinite query hook
  const { 
    data,           // Data object (contains pages array)
    fetchNextPage,  // Function to fetch the next page
    hasNextPage,    // Boolean indicating if there are more pages
    isLoading,      // Is the initial page loading?
    isFetchingNextPage, // Is the next page currently being fetched?
    isError,        // Was there an error fetching?
    error           // The error object
  } = usePostsQuery();
  
  // --- Infinite Scroll Setup ---
  // `useInView` returns a ref and a boolean `inView`.
  // Attach the `ref` to an element near the bottom of the list.
  // `inView` becomes true when that element enters the viewport.
  const { ref: loadMoreRef, inView } = useInView({
      threshold: 0.5, // Trigger when 50% of the element is visible
      triggerOnce: false // Trigger every time it enters view
  });

  // Effect to fetch the next page when the `loadMoreRef` element becomes visible
  useEffect(() => {
    // Only fetch if the trigger element is in view, there's a next page, and not already fetching
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Load more trigger in view, fetching next page...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Render Logic ---

  // Initial loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading feed...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Feed</AlertTitle>
        <AlertDescription>
          {error?.message || "Could not load posts. Please try again later."}
        </AlertDescription>
        {/* Optional: Add a retry button */}
        {/* <Button onClick={() => refetch()} variant="destructive" size="sm" className="mt-2">Retry</Button> */}
      </Alert>
    );
  }

  // --- Prepare Posts Data ---
  // `data.pages` is an array where each element is the result from fetching one page.
  // `flatMap` combines the `posts` array from each page into a single flat array.
  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="space-y-4">
      {/* Render the list of posts */}
      <PostList posts={posts} /> 
      
      {/* --- Load More Trigger & Indicator --- */}
      {/* Display only if there are more pages */} 
      {hasNextPage && (
        <div 
          ref={loadMoreRef} // Attach the ref here
          className="flex justify-center p-6 mt-4" 
        >
          {/* Show loading spinner only when fetching the next page */}
          {isFetchingNextPage && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
          {/* Add a placeholder element to ensure the ref trigger has height even when not loading */}
          {!isFetchingNextPage && <div className="h-1 w-1" />} 
        </div>
      )}
      
      {/* Optional: Message when all posts are loaded */}
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center p-6 mt-4 text-sm text-muted-foreground">
          You've reached the end of the feed.
        </div>
      )}
    </div>
  );
}

export default Feed; 