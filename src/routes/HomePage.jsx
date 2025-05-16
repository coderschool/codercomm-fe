import React, { useEffect } from "react";

import PostList from "@/features/post/PostList";
import PostForm from "@/features/post/PostForm";

import { usePosts } from "@/features/post/postSlice";
import { Card } from "@/components/ui/card";

function HomePage() {
  const { fetchPosts } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container flex gap-4 py-6">
      <Card className="w-96 flex flex-col h-[400px] border"></Card>

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

      <Card className="w-96 flex flex-col h-[400px] border"></Card>
    </div>
  );
}

export default HomePage;
