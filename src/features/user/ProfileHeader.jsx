import React from "react";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  Calendar,
  Users,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import ActionButton from "@/features/friend/ActionButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "./userStore";

function ProfileHeader() {
  const { user } = useUser();

  console.log(user);

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

          <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-muted-foreground mt-1">
            <span>
              <strong>{user.postCount ?? 0}</strong> Posts
            </span>
            <span>
              <strong>{user.friendCount ?? 0}</strong> Friends
            </span>
          </div>
        </div>

        {/* Action Buttons: Dropdown for self, ActionButton for others */}
        {/* <div className="ml-auto mt-4 sm:mt-0 sm:mb-2 flex-shrink-0">
            {isCurrentUserProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/friends">
                      <Users className="mr-2 h-4 w-4" />
                      <span>My Friends</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/requests">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Friend Requests</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : showFriendActionButton ? (
              <ActionButton
                targetUserId={user._id}
                requestId={requestId}
                context={actionContext}
              />
            ) : null}
          </div> */}
      </div>
    </>
  );
}

export default ProfileHeader;
