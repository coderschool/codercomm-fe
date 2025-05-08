import React from "react";
import { useAppStore } from "@/features/use-app-store";
import UserProfileHeader from "@/features/user/UserProfileHeader";
import PostList from "@/features/post/PostList";
import PostForm from "@/features/post/PostForm";
import { Loader2 } from "lucide-react";

/**
 * Home Page Component:
 * Displays the current user's profile header, post form, and their own posts.
 */
function HomePage() {
  const { currentUser, isLoadingAuth } = useAppStore();

  // Show loading state while initial auth check is happening
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Should not happen after initial load if AuthRequire works, but safety check
  if (!currentUser) {
    return (
      <div className="text-center p-8 text-destructive">
        Error: User not found. Please try logging in again.
      </div>
    );
  }

  return (
    // Use container/max-width for consistent layout
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Display the Header for the Current User */}
      <UserProfileHeader user={currentUser} />

      {/* Center Post Form and List */}
      <div className="max-w-xl mx-auto">
        {/* Display Post Form */}
        <PostForm />

        {/* Display Posts by the Current User */}
        <h2 className="text-lg font-semibold mb-4 mt-6">Your Posts</h2>
        <PostList userId={currentUser._id} />
      </div>
    </div>
  );
}

export default HomePage;
