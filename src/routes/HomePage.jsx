import React, { useEffect } from "react";

import PostList from "@/features/post/PostList";
import PostForm from "@/features/post/PostForm";

import { usePost } from "@/features/post/postSlice";

function HomePage() {
  const { fetchPosts } = usePost();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container flex gap-4 py-6">
      <div className="w-96 flex flex-col h-[400px] border"></div>

      {/* Center Post Form and List */}
      <div className="w-full flex flex-col gap-4">
        {/* Display Post Form */}
        <PostForm />

        {/* Display Posts by the Current User */}
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Your Posts</h2>
          <PostList />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
