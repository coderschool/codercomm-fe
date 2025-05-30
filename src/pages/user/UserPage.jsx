import { useNavigate, useParams } from "react-router";
import { PostStoreProvider } from "@/features/post/PostStoreProvider";
import UserHeader from "@/features/user/UserHeader";
import UserInfo from "@/features/user/UserInfo";
import UserPostSection from "./UserPostSection";
import { useEffect } from "react";
import { useUser } from "@/features/user/UserStoreProvider";

function UserPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { fetchUser } = useUser((state) => state.actions);
  const error = useUser((state) => state.error);

  useEffect(() => {
    fetchUser(userId);
  }, [fetchUser, userId]);

  if (error) {
    navigate("/not-found");
  }

  return (
    <>
      <UserHeader />
      <div className="flex gap-4 px-10 pb-10">
        <UserInfo />
        <PostStoreProvider>
          <UserPostSection />
        </PostStoreProvider>
      </div>
    </>
  );
}

export default UserPage;
