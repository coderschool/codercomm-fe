import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileScorecard from "./ProfileScorecard";
import ProfileAbout from "./ProfileAbout";
import ProfileSocialInfo from "./ProfileSocialInfo";
import PostList from "../post/PostList";
import { useGetCurrentUserProfile } from "./userHooks";

function Profile({ profile }) {
  const { refetch } = useGetCurrentUserProfile();

  useEffect(() => {
    // Refetch current user data when profile component mounts
    refetch();
  }, [refetch]);

  return (
    <div className="container">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <ProfileScorecard profile={profile} />
          <ProfileAbout profile={profile} />
          <ProfileSocialInfo profile={profile} />
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList className="mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              <PostList userId={profile._id} />
            </TabsContent>
            
            <TabsContent value="about">
              <div className="space-y-6">
                <ProfileAbout profile={profile} />
                <ProfileSocialInfo profile={profile} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Profile;
