import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import useAuth from "@/hooks/useAuth";
import ActionButton from "./ActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Clock } from "lucide-react";

import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

/**
 * Displays a user's information in a card format, 
 * including name, avatar, and an appropriate action button.
 */
function UserCard({ profile, friendshipContext = 'search' }) {
  const { user: currentUser } = useAuth();
  if (!currentUser) return null; // Don't render if current user isn't loaded

  const { 
      _id: targetUserId, 
      name,
      avatarUrl,
      email, // Included for display, consider privacy
      friendship // This comes from the API response (e.g., in /users search)
  } = profile;

  // Don't show card for the current user in search/lists
  if (currentUser._id === targetUserId && friendshipContext !== 'request') return null; 

  // Determine the context for the action button based on friendship status
  let actionContext = friendshipContext;
  if (friendship) {
      if (friendship.status === 'pending' && friendship.to === currentUser._id) {
          actionContext = 'incoming_request';
      } else if (friendship.status === 'pending' && friendship.from === currentUser._id) {
          actionContext = 'outgoing_request';
      } else if (friendship.status === 'accepted') {
          actionContext = 'friend';
      }
      // Add declined/blocked later if needed
  }

  return (
    <Card className={cn("p-3", 
        // Add subtle indicator for pending requests (optional)
        actionContext === 'incoming_request' && "border-primary/50",
        actionContext === 'outgoing_request' && "border-dashed"
    )}>
      <div className="flex items-center justify-between gap-2">
        {/* Left side: Avatar and Info */}
        <div className="flex items-center gap-2 overflow-hidden">
          <Link to={`/user/${targetUserId}`} className="flex-shrink-0">
            <Avatar className="w-10 h-10 border">
              <AvatarImage src={avatarUrl || ''} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/user/${targetUserId}`}
              className="font-semibold text-sm hover:underline block truncate"
              title={name} // Show full name on hover
            >
              {name}
            </Link>
            {/* Optionally show email or other info */}
            {/* <p className="text-xs text-muted-foreground truncate" title={email}>{email}</p> */} 
          </div>
        </div>
        
        {/* Right side: Action Button */}
        <div className="flex-shrink-0">
          <ActionButton
            targetUserId={targetUserId}
            context={actionContext} // Pass the determined context
          />
        </div>
      </div>
      
      {/* Optional: Timestamp for pending requests */}
      {/* Display based on original friendship object, not derived context */} 
      {friendship && friendship.status === "pending" && friendship.createdAt && (
        <div className="ml-12 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Request {friendship.from === currentUser._id ? "sent" : "received"} {formatDistanceToNow(new Date(friendship.createdAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </Card>
  );
}

UserCard.propTypes = {
  profile: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
      email: PropTypes.string,
      friendship: PropTypes.object, // Friendship object might be present
      createdAt: PropTypes.string, // For pending request display
  }).isRequired,
  // Context helps ActionButton decide what to render if friendship status isn't on profile
  friendshipContext: PropTypes.oneOf(['search', 'friend_list', 'request']).isRequired,
};

export default UserCard;

