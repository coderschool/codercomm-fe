import React from "react";
import Profile from "@/features/user/Profile";
import ProfileCover from "@/features/user/ProfileCover";
import { useParams } from "react-router-dom";
import { useGetUserProfile } from "@/features/user/userHooks";

function UserProfilePage() {
  const params = useParams();
  const userId = params.userId;
  
  const { data: selectedUser, isLoading } = useGetUserProfile(userId);

  return (
    <div className="container mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="mb-6 h-[280px] relative rounded-lg overflow-hidden bg-background">
            {selectedUser && <ProfileCover profile={selectedUser} />}
          </div>
          {selectedUser && <Profile profile={selectedUser} />}
        </>
      )}
    </div>
  );
}

export default UserProfilePage;
