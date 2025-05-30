import PostList from "@/features/post/PostList";
import { usePost } from "@/features/post/PostStoreProvider";
import { useAuth } from "@/lib/auth/useAuth";
import { useEffect } from "react";
import PostForm from "@/features/post/PostForm";
import { useParams } from "react-router";

function UserPostSection() {
  const hasMore = usePost((state) => state.hasMore);
  const { fetchUserPosts } = usePost((state) => state.actions);
  const currentUser = useAuth((state) => state.currentUser);
  const { userId } = useParams();

  const isCurrentUser = currentUser._id === userId;

  useEffect(() => {
    fetchUserPosts(userId);
  }, [fetchUserPosts, userId]);

  return (
    <div className="w-full flex flex-col gap-4">
      {isCurrentUser && <PostForm />}

      <h2 className="text-lg font-semibold">
        {isCurrentUser ? "Your Posts" : "Their Posts"}
      </h2>

      <PostList />
      {hasMore && (
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary py-2"
          onClick={() => fetchUserPosts(userId)}
        >
          Load more posts
        </button>
      )}
    </div>
  );
}

export default UserPostSection;
