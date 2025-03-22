import React from "react";
import { 
  useSendFriendRequest, 
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend
} from "./friendHooks";
import { Button } from "@/components/ui/button";

function ActionButton({ currentUserId, targetUserId, friendship, className }) {
  const sendRequestMutation = useSendFriendRequest();
  const acceptRequestMutation = useAcceptFriendRequest();
  const declineRequestMutation = useDeclineFriendRequest();
  const cancelRequestMutation = useCancelFriendRequest();
  const removeFriendMutation = useRemoveFriend();

  if (currentUserId === targetUserId) return null;

  const btnSendRequest = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      onClick={() => sendRequestMutation.mutate(targetUserId)}
      disabled={sendRequestMutation.isPending}
    >
      {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
    </Button>
  );

  if (!friendship) return btnSendRequest;

  const btnUnfriend = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      variant="destructive"
      onClick={() => removeFriendMutation.mutate(targetUserId)}
      disabled={removeFriendMutation.isPending}
    >
      {removeFriendMutation.isPending ? "Removing..." : "Unfriend"}
    </Button>
  );
  
  const btnResend = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      onClick={() => sendRequestMutation.mutate(targetUserId)}
      disabled={sendRequestMutation.isPending}
    >
      {sendRequestMutation.isPending 
        ? "Sending..." 
        : `${friendship.from === currentUserId ? "Resend" : "Send"} Request`}
    </Button>
  );
  
  const btnCancelRequest = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      variant="destructive"
      onClick={() => cancelRequestMutation.mutate(targetUserId)}
      disabled={cancelRequestMutation.isPending}
    >
      {cancelRequestMutation.isPending ? "Canceling..." : "Cancel Request"}
    </Button>
  );
  
  const btnGroupReact = (
    <div className="flex flex-row gap-1">
      <Button
        className={`text-xs ${className}`}
        size="sm"
        variant="default"
        onClick={() => acceptRequestMutation.mutate(targetUserId)}
        disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
      >
        {acceptRequestMutation.isPending ? "Accepting..." : "Accept"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-xs text-destructive border-destructive hover:bg-destructive/10"
        onClick={() => declineRequestMutation.mutate(targetUserId)}
        disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
      >
        {declineRequestMutation.isPending ? "Declining..." : "Decline"}
      </Button>
    </div>
  );

  if (friendship.status === "accepted") {
    return btnUnfriend;
  }

  if (friendship.status === "declined") {
    return btnResend;
  }

  if (friendship.status === "pending") {
    const { from, to } = friendship;
    if (from === currentUserId && to === targetUserId) {
      return btnCancelRequest;
    } else if (from === targetUserId && to === currentUserId) {
      return btnGroupReact;
    }
  }

  return btnSendRequest;
}

export default ActionButton;
