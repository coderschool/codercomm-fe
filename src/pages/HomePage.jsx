import React from "react";
import useAuth from "@/hooks/useAuth";
import PostForm from "@/features/post/PostForm";
import Feed from "@/features/post/Feed";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Home Page Component:
 * Displays the Post Creation form and the main Feed.
 */
function HomePage() {
  const { user, isInitialized } = useAuth();

  // Show loading screen only if auth isn't initialized yet
  // Feed component will handle its own loading state
  if (!isInitialized) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Content Area (Feed and Post Form) */}
      <div className="col-span-12 lg:col-span-8">
        {/* Only show PostForm if user is loaded */}
        {user && <PostForm />} 
        <Feed />
      </div>

      {/* Sidebar/Widgets Area (Placeholder) */}
      <div className="hidden lg:block lg:col-span-4">
        <div className="sticky top-20 space-y-6">
          {/* Add Friend Suggestions, Trending Topics etc. later */}
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Suggestions</h3>
            <p className="text-sm text-muted-foreground">Friend suggestions or trending topics could go here.</p>
          </div>
           <div className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Advertisement</h3>
            <p className="text-sm text-muted-foreground">Placeholder for ads or other widgets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;