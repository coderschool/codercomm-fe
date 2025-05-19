import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";

import ActionButton from "./ActionButton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/mergeClassName";
import { useAuth } from "../auth/authStore";

/**
 * Displays a user card for a friend or a friend request.
 * Determines context and user info based on provided 'friendship' or 'request' prop.
 */
function FriendCard({ friendship, request }) {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  let displayUser = null;
  let actionContext = "search"; // Should be overridden
  let requestId = null;
  let friendshipId = null;
  let requestTimestamp = null;

  if (friendship) {
    // --- Handling Friendship ---
    actionContext = "friend";
    // Assuming 'friendship' object *is* the friend's profile data
    // If it's a join object, adjust access: e.g., friendship.friendUser
    displayUser = friendship;
    friendshipId = friendship._id; // Assuming removeFriend uses the friend's userId

    // Don't render card if the friend is the current user (shouldn't happen)
    if (currentUser._id === displayUser._id) return null;
  } else if (request) {
    // --- Handling Request ---
    requestId = request._id;
    requestTimestamp = request.createdAt;

    // Determine if incoming or outgoing and set the user to display
    if (request.from === currentUser._id) {
      actionContext = "outgoing_request";
      displayUser = request.receiver; // Display the recipient
    } else if (request.receiver?._id === currentUser._id) {
      actionContext = "incoming_request";
      displayUser = request.sender; // Display the sender
    } else {
      // Should not happen if data is correct
      console.warn("FriendCard: Request object doesn't involve current user.", {
        request,
        currentUser,
      });
      return null; // Don't render if request is invalid for current user
    }

    // Handle case where sender/recipient data might be missing in the request object
    if (!displayUser) {
      console.warn(
        "FriendCard: Missing sender/recipient data in request object.",
        { request }
      );
      return (
        <Card className="p-3 border-destructive">
          <p className="text-xs text-destructive">
            Invalid request data (Missing user info)
          </p>
          <p className="text-xs text-muted-foreground">
            Request ID: {request._id}
          </p>
        </Card>
      );
    }

    // Don't render card if the request involves the current user displaying themselves (shouldn't happen)
    if (currentUser._id === displayUser._id) return null;
  } else {
    // No friendship or request provided, don't render
    return null;
  }

  // Extract details from the determined displayUser
  const { _id: targetUserId, name, avatarUrl } = displayUser;

  return (
    <Card
      className={cn(
        "p-3",
        actionContext === "incoming_request" && "border-primary/50",
        actionContext === "outgoing_request" && "border-dashed"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left side: Avatar and Info */}
        <div className="flex items-center gap-2 overflow-hidden">
          <Link to={`/users/${targetUserId}`} className="flex-shrink-0">
            <Avatar className="w-10 h-10 border">
              <AvatarImage src={avatarUrl || ""} alt={name || "User"} />
              <AvatarFallback>{getInitials(name || "")}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/users/${targetUserId}`}
              className="font-semibold text-sm hover:underline block truncate"
              title={name || "Unknown User"} // Show full name on hover
            >
              {name || "Unknown User"}
            </Link>
          </div>
        </div>

        {/* Right side: Action Button */}
        <div className="flex-shrink-0">
          <ActionButton
            targetUserId={targetUserId}
            requestId={requestId}
            friendshipId={friendshipId}
            context={actionContext}
          />
        </div>
      </div>

      {/* Timestamp for pending requests */}
      {(actionContext === "incoming_request" ||
        actionContext === "outgoing_request") &&
        requestTimestamp && (
          <div className="ml-12 mt-1 flex items-center">
            <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Request{" "}
              {actionContext === "outgoing_request" ? "sent" : "received"}{" "}
              {formatDistanceToNow(new Date(requestTimestamp), {
                addSuffix: true,
              })}
            </p>
          </div>
        )}
    </Card>
  );
}

FriendCard.propTypes = {
  // Pass EITHER friendship OR request
  friendship: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string, // Assuming friend object has user details
    avatarUrl: PropTypes.string,
    // Add other expected friend properties if needed for display/logic
  }),
  request: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    requester: PropTypes.shape({
      // Expect sender details
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    recipient: PropTypes.shape({
      // Expect recipient details
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    status: PropTypes.string, // Should be 'pending' if passed here
    createdAt: PropTypes.string,
  }),
};

// Custom validation to ensure either friendship or request is provided, but not both
FriendCard.propTypes.checkProps = (props, propName, componentName) => {
  if (!props.friendship && !props.request) {
    return new Error(
      `One of props 'friendship' or 'request' was not specified in '${componentName}'.`
    );
  }
  if (props.friendship && props.request) {
    return new Error(
      `Props 'friendship' and 'request' cannot both be specified in '${componentName}'. Provide only one.`
    );
  }
  return null; // Validation passed
};

export default FriendCard;
