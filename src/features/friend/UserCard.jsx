import React from "react";
import { Link } from "react-router-dom";
import { Mail, Clock } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import ActionButton from "./ActionButton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/utils/formatTime";

function UserCard({ profile }) {
  const { user } = useAuth();
  const currentUserId = user._id;
  const { _id: targetUserId, name, avatarUrl, email, friendship } = profile;

  const actionButton = (
    <ActionButton
      currentUserId={currentUserId}
      targetUserId={targetUserId}
      friendship={friendship}
    />
  );

  return (
    <Card className="flex flex-col p-3">
      <div className="flex items-center w-full">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0 pl-2 pr-1">
          <Link
            to={`/user/${targetUserId}`}
            className="font-semibold text-sm hover:underline"
          >
            {name}
          </Link>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              {email}
            </p>
          </div>
        </div>
        {actionButton}
      </div>
      
      {friendship && friendship.status === "pending" && friendship.createdAt && (
        <div className="ml-14 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Request {friendship.from === currentUserId ? "sent" : "received"} {formatTimeAgo(friendship.createdAt)}
          </p>
        </div>
      )}
    </Card>
  );
}

export default UserCard;
