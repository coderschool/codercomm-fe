import PostList from "@/features/post/PostList";
import { usePostAction, usePostState } from "@/features/post/PostStoreProvider";
import { useAuthState } from "@/lib/auth/useAuth";
import { useEffect } from "react";
import PostForm from "@/features/post/PostForm";
import { useParams } from "react-router";

function UserPostSection() {
  const { hasMore } = usePostState();
  const { fetchUserPosts } = usePostAction();
  const { currentUser } = useAuthState();
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
