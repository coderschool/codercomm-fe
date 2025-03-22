import React from "react";
import ProfileAbout from "./ProfileAbout";
import ProfileSocialInfo from "./ProfileSocialInfo";
import PostForm from "../post/PostForm";
import ProfileScorecard from "./ProfileScorecard";
import PostList from "../post/PostList";
import useAuth from "@/hooks/useAuth";

function Profile({ profile }) {
  const { user } = useAuth();
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4">
        <div className="flex flex-col space-y-6">
          <ProfileScorecard profile={profile} />
          <ProfileAbout profile={profile} />
          <ProfileSocialInfo profile={profile} />
        </div>
      </div>

      <div className="md:col-span-8">
        <div className="flex flex-col space-y-6">
          {user._id === profile._id && <PostForm />}
          <PostList userId={profile._id} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
