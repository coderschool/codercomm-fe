import React from "react";
// import { useUserPosts } from "@/hooks/useUserQuery"; // Removed
import PostList from "./PostList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
// import useAuth from "@/hooks/useAuth"; // Removed
import { useAppStore } from "@/features/use-app-store"; // Added

/**
 * Feed Component:
 * - Renders the PostList component, which fetches and displays all posts.
 * - Checks for logged-in user (though PostList handles most logic now).
 */
function Feed() {
  // Get user status, though PostList fetches data regardless
  // const currentUser = useAppStore((state) => state.currentUser);

  // Note: PostList now handles its own fetching, loading, and error states internally
  // when no 'posts' prop is passed. We just need to render it.

  // Optional: Add a check or message if the user isn't logged in,
  // although authenticated routes should typically handle this.
  // if (!currentUser) {
  //   return <p>Please log in to see the feed.</p>;
  // }

  return (
    <PostList /> // Render PostList without props to trigger internal fetching
  );
}

export default Feed;
