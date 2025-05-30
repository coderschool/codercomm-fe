import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getInitials } from "@/utils/get-initials";

import { useUser } from "./UserStoreProvider";
import UserHeaderFallback from "./UserHeaderFallback";

function UserHeader() {
  const user = useUser((state) => state.user);
  const isLoading = useUser((state) => state.isLoading);

  if (isLoading) {
    return <UserHeaderFallback />;
  }

  return (
    <>
      <div className="h-48 md:h-80 w-full overflow-hidden">
        {user.coverUrl ? (
          <img
            src={user.coverUrl}
            alt={`${user.name}'s cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary/50" />
        )}
      </div>

      {/* Avatar and Info */}
      <div className="flex flex-col gap-4 sm:flex-row items-center sm:items-end  px-4 sm:px-6  z-10 translate-y-[-50%]">
        <Avatar className="h-32 w-32 sm:h-48 sm:w-48 border-4 border-background bg-background">
          <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
          <AvatarFallback className="text-4xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center sm:items-start h-full sm:translate-y-[-40%]">
          <h1
            className="text-2xl md:text-3xl font-bold truncate"
            title={user.name}
          >
            {user.name}
          </h1>

          <span className="text-sm text-muted-foreground">
            <strong>{user.postCount ?? 0}</strong> Posts
          </span>
        </div>
      </div>
    </>
  );
}

export default UserHeader;
