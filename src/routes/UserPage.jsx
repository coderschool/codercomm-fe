import React, { useEffect } from "react";
import { useParams } from "react-router";
import PostList from "@/features/post/PostList";
import { usePosts } from "@/features/post/postStore";
import { useUser } from "@/features/user/userStore";
import ProfileHeader from "@/features/user/ProfileHeader";
import ProfileInfo from "@/features/user/ProfileInfo";
import PostForm from "@/features/post/PostForm";
import { useAuth } from "@/features/auth/authStore";

function UserPage() {
  const { userId } = useParams();
  const { currentUser } = useAuth();

  const { fetchUserPosts } = usePosts();
  const { fetchUserProfile } = useUser();

  const isCurrentUser = currentUser?._id === userId;

  useEffect(() => {
    fetchUserProfile(userId);
    fetchUserPosts(userId);
  }, [userId, fetchUserPosts, fetchUserProfile]);

  return (
    <>
      <ProfileHeader />

      <div className="flex gap-4 px-10 pb-6">
        <ProfileInfo />

        <div className="grow flex flex-col gap-4">
          {isCurrentUser && <PostForm />}
          <div className="flex flex-col gap-4">
            {isCurrentUser && (
              <h4 className="text-lg font-semibold">Your Posts</h4>
            )}
            <PostList />
          </div>
        </div>
      </div>
    </>
  );
}

export default UserPage;
