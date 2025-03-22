import React from "react";
import useAuth from "@/hooks/useAuth";
import ActionButton from "@/features/friend/ActionButton";
import FriendStatus from "@/features/friend/FriendStatus";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function ProfileCover({ profile }) {
  const { user } = useAuth();
  const currentUserId = user._id;
  const {
    _id: targetUserId,
    name,
    jobTitle,
    coverUrl,
    avatarUrl,
    friendship,
  } = profile;

  const handleError = (e) => {
    const imgIndex = Math.floor(Math.random() * 5) + 1;
    e.target.src = `/covers/cover_${imgIndex}.jpeg`;
    e.target.onError = null;
  };

  const friendStatus = (
    <FriendStatus
      className="mt-1"
      currentUserId={currentUserId}
      targetUserId={targetUserId}
      friendship={friendship}
    />
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-[1px] z-[9]"></div>
      <div className="absolute left-0 right-0 z-[99] mt-5 md:right-auto md:flex md:items-center md:left-3 md:bottom-3">
        <Avatar className="w-20 h-20 md:w-32 md:h-32 mx-auto border-2 border-solid border-white">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="md:ml-3 mt-1 md:mt-0 text-white text-center md:text-left">
          <h5 className="text-xl font-bold">{name}</h5>
          <p className="opacity-70">{jobTitle}</p>
          {friendStatus ? (
            friendStatus
          ) : (
            <ActionButton
              className="mt-1"
              currentUserId={currentUserId}
              targetUserId={targetUserId}
              friendship={friendship}
            />
          )}
        </div>
      </div>
      <div className="overflow-hidden">
        <img
          src={coverUrl}
          alt="profile cover"
          className="w-full h-full"
          onError={handleError}
        />
      </div>
    </div>
  );
}

export default ProfileCover;
