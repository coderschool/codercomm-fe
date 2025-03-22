import React from "react";
import { 
  CheckCircle, 
  PauseCircle, 
  MailCheck, 
  XCircle 
} from "lucide-react";

function FriendStatus({ currentUserId, targetUserId, friendship, className }) {
  if (currentUserId === targetUserId) return null;
  if (!friendship) return null;

  if (friendship.status === "accepted") {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium ${className}`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        Friend
      </div>
    );
  }

  if (friendship.status === "declined") {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium ${className}`}>
        <XCircle className="w-3 h-3 mr-1" />
        Declined
      </div>
    );
  }

  if (friendship.status === "pending") {
    const { from, to } = friendship;
    if (from === currentUserId && to === targetUserId) {
      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium ${className}`}>
          <MailCheck className="w-3 h-3 mr-1" />
          Request sent
        </div>
      );
    } else if (from === targetUserId && to === currentUserId) {
      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium ${className}`}>
          <PauseCircle className="w-3 h-3 mr-1" />
          Waiting for response
        </div>
      );
    }
  }

  return null;
}

export default FriendStatus;
