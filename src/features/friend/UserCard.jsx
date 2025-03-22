import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import ActionButton from "./ActionButton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    <Card className="flex items-center p-3">
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
    </Card>
  );
}

export default UserCard;
