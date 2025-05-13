import React, { useEffect } from "react";
import { useParams } from "react-router";
import PostList from "@/features/post/PostList"; // Use the updated list

import { usePost } from "@/features/post/postSlice";

function UserProfilePage() {
  const { userId } = useParams(); // Get userId from route params
  const { fetchUserPosts } = usePost();

  // Fetch profile when userId changes
  useEffect(() => {
    fetchUserPosts(userId);
  }, [userId, fetchUserPosts]);

  // If profile loaded successfully, render header and post list
  return (
    <div className="space-y-6">
      {/* Pass the fetched profile data to the header */}
      {/* <UserProfileHeader user={profile} /> */}

      {/* Add a divider or heading for posts */}
      <div className="container mx-auto px-4">
        {/* Center the PostList similar to the Feed */}
        <div className="max-w-xl mx-auto">
          <PostList />
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
