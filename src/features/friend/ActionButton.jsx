import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus, UserCheck, UserX, XCircle } from "lucide-react";

/**
 * Renders the appropriate friend action button based on the relationship context.
 * @param {object} props
 * @param {string} props.targetUserId - The ID of the user the action applies to.
 * @param {string} [props.requestId] - The ID of the friend request (if applicable).
 * @param {string} [props.friendshipId] - The ID of the friendship (if applicable, for removing).
 * @param {string} props.context - The relationship context ('search', 'friend', 'incoming_request', 'outgoing_request').
 */
function ActionButton({ targetUserId, requestId, friendshipId, context }) {
  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
  } = useAppStore((state) => ({
    sendFriendRequest: state.sendFriendRequest,
    acceptFriendRequest: state.acceptFriendRequest,
    rejectFriendRequest: state.rejectFriendRequest,
    cancelFriendRequest: state.cancelFriendRequest,
    removeFriend: state.removeFriend,
  }));

  const [isLoading, setIsLoading] = useState(false);

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      await sendFriendRequest(targetUserId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      await acceptFriendRequest(requestId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      await rejectFriendRequest(requestId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      await cancelFriendRequest(requestId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    const idToRemove = friendshipId || targetUserId;
    if (!idToRemove) return;
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    setIsLoading(true);
    try {
      await removeFriend(idToRemove);
    } finally {
      setIsLoading(false);
    }
  };

  if (context === 'search') {
    return (
      <Button size="sm" onClick={handleSendRequest} disabled={isLoading}>
        {isLoading ?
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
            <UserPlus className="mr-2 h-4 w-4" />}
        Add Friend
      </Button>
    );
  }

  if (context === 'friend') {
    return (
      <Button size="sm" variant="outline" onClick={handleRemoveFriend} disabled={isLoading}>
         {isLoading ?
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
            <UserMinus className="mr-2 h-4 w-4" />}
        Unfriend
      </Button>
    );
  }

  if (context === 'incoming_request') {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button size="sm" onClick={handleAcceptRequest} disabled={isLoading || !requestId}>
          {isLoading ?
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
              <UserCheck className="mr-2 h-4 w-4" />}
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={handleRejectRequest} disabled={isLoading || !requestId}>
          {isLoading ?
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
              <UserX className="mr-2 h-4 w-4" />}
          Decline
        </Button>
      </div>
    );
  }

  if (context === 'outgoing_request') {
    return (
      <Button size="sm" variant="outline" onClick={handleCancelRequest} disabled={isLoading || !requestId}>
         {isLoading ?
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
            <XCircle className="mr-2 h-4 w-4" />}
        Cancel Request
      </Button>
    );
  }

  return null;
}

ActionButton.propTypes = {
  targetUserId: PropTypes.string.isRequired,
  requestId: PropTypes.string,
  friendshipId: PropTypes.string,
  context: PropTypes.oneOf(['search', 'friend', 'incoming_request', 'outgoing_request']).isRequired,
};

export default ActionButton;
