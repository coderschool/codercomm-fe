import React from "react";
import PropTypes from 'prop-types';
import {
  useSendFriendRequest, 
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend
} from "@/hooks/useFriendQuery";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus, UserCheck, UserX, XCircle } from "lucide-react";

/**
 * Renders the appropriate friend action button based on the relationship context.
 * @param {object} props
 * @param {string} props.targetUserId - The ID of the user the action applies to.
 * @param {string} props.context - The relationship context ('search', 'friend', 'incoming_request', 'outgoing_request').
 */
function ActionButton({ targetUserId, context }) {
  const { mutate: sendRequestMutate, isPending: isSending } = useSendFriendRequest();
  const { mutate: acceptRequestMutate, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: declineRequestMutate, isPending: isDeclining } = useDeclineFriendRequest();
  const { mutate: cancelRequestMutate, isPending: isCancelling } = useCancelFriendRequest();
  const { mutate: removeFriendMutate, isPending: isRemoving } = useRemoveFriend();

  const isLoading = isSending || isAccepting || isDeclining || isCancelling || isRemoving;

  if (context === 'search') {
    return (
      <Button size="sm" onClick={() => sendRequestMutate(targetUserId)} disabled={isLoading}>
        {isSending ? 
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <UserPlus className="mr-2 h-4 w-4" />}
        Add Friend
      </Button>
    );
  }

  if (context === 'friend') {
    return (
      <Button size="sm" variant="outline" onClick={() => removeFriendMutate(targetUserId)} disabled={isLoading}>
         {isRemoving ? 
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <UserMinus className="mr-2 h-4 w-4" />}
        Unfriend
      </Button>
    );
  }

  if (context === 'incoming_request') {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button size="sm" onClick={() => acceptRequestMutate(targetUserId)} disabled={isLoading}>
          {isAccepting ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <UserCheck className="mr-2 h-4 w-4" />}
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => declineRequestMutate(targetUserId)} disabled={isLoading}>
          {isDeclining ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <UserX className="mr-2 h-4 w-4" />}
          Decline
        </Button>
      </div>
    );
  }

  if (context === 'outgoing_request') {
    return (
      <Button size="sm" variant="outline" onClick={() => cancelRequestMutate(targetUserId)} disabled={isLoading}>
         {isCancelling ? 
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
  context: PropTypes.oneOf(['search', 'friend', 'incoming_request', 'outgoing_request']).isRequired,
};

export default ActionButton;
