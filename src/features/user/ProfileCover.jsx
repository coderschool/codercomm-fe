import React from "react";
import useAuth from "@/hooks/useAuth";
import ActionButton from "@/features/friend/ActionButton";
import FriendStatus from "@/features/friend/FriendStatus";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function ProfileCover({ profile }) {
  const { user } = useAuth();
  const currentUserId = user?._id;
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

  // Get first character of name safely
  const nameInitial = name && typeof name === 'string' ? name.charAt(0) : '?';
  const displayName = name || '';

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-primary/30 backdrop-blur-[1px] z-[1]"></div>
      <div className="absolute left-0 right-0 bottom-12 z-[10] md:right-auto md:flex md:items-center md:left-6">
        <Avatar className="w-20 h-20 md:w-28 md:h-28 mx-auto border-4 border-solid border-white shadow-md">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{nameInitial}</AvatarFallback>
        </Avatar>
        <div className="md:ml-5 mt-3 md:mt-0 text-white text-center md:text-left">
          <h5 className="text-xl font-bold drop-shadow-md">{displayName}</h5>
          <p className="opacity-90 drop-shadow-md">{jobTitle || ""}</p>
          {currentUserId && targetUserId && currentUserId !== targetUserId && (
            <>
              {friendship ? (
                friendStatus
              ) : (
                <ActionButton
                  className="mt-1"
                  currentUserId={currentUserId}
                  targetUserId={targetUserId}
                  friendship={friendship}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="h-full w-full overflow-hidden">
        <img
          src={coverUrl || `/covers/cover_1.jpeg`}
          alt="profile cover"
          className="w-full h-full object-cover"
          onError={handleError}
        />
      </div>
    </div>
  );
}

export default ProfileCover;
