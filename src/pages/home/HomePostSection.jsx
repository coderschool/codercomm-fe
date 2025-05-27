import PostForm from "@/features/post/PostForm";
import PostList from "@/features/post/PostList";
import { usePostAction, usePostState } from "@/features/post/PostStoreProvider";
import { useEffect } from "react";

function HomePostSection() {
  const { hasMore, posts, isLoading } = usePostState();
  const { fetchPosts } = usePostAction();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="w-full h-full flex flex-col gap-4 pb-4">
      <PostForm />
      <h2 className="text-lg font-semibold">Your Feed</h2>
      <PostList />

      {!isLoading && hasMore && (
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary py-4"
          onClick={() => fetchPosts()}
        >
          Load more posts
        </button>
      )}
    </div>
  );
}

export default HomePostSection;
