import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Link, useNavigate } from 'react-router-dom'; // Added Link
import { useAppStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Calendar, Users, UserPlus, MoreHorizontal } from 'lucide-react'; // Added icons
import { getInitials } from '@/utils/formatters'; // Import utility
import ActionButton from '@/features/friend/ActionButton'; // Import ActionButton
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

/**
 * Displays profile header for a given user.
 * Shows Edit button for current user, Friend actions for others.
 * @param {object} props
 * @param {object} props.user - The user profile object to display.
 */
function UserProfileHeader({ user }) {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);

  if (!user || !currentUser) {
    // Should ideally show a skeleton loader here
    return <div className="h-[268px] md:h-[300px] bg-muted rounded-lg mb-6 animate-pulse"></div>
  }

  const isCurrentUserProfile = currentUser._id === user._id;

  // Determine context for ActionButton based on friendship status
  const friendship = user.friendship; // From populated /users/:id endpoint
  let actionContext = 'search'; // Default for non-friend, non-pending
  let requestId = null;

  if (friendship) {
      requestId = friendship._id; // Needed for actions on requests
      if (friendship.status === 'accepted') {
          actionContext = 'friend';
      } else if (friendship.status === 'pending') {
          // Check if current user sent the request or received it
          actionContext = friendship.from === currentUser._id ? 'outgoing_request' : 'incoming_request';
      }
  }

  // Don't show friend button if it's the user's own profile
  const showFriendActionButton = !isCurrentUserProfile;

  return (
    <div className="space-y-6 mb-6">
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted">
          {user.coverUrl ? (
            <img src={user.coverUrl} alt={`${user.name}'s cover`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary/50" />
          )}
        </div>

        {/* Avatar and Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background bg-background">
            <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
            <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="ml-0 sm:ml-4 mt-2 sm:mb-2 text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold truncate" title={user.name}>{user.name}</h1>
            {user.createdAt && (
              <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
            )}
            <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-muted-foreground mt-2">
               <span><strong>{user.postCount ?? 0}</strong> Posts</span>
               <span><strong>{user.friendCount ?? 0}</strong> Friends</span>
            </div>
          </div>

          {/* Action Buttons: Dropdown for self, ActionButton for others */}
          <div className="ml-auto mt-4 sm:mt-0 sm:mb-2 flex-shrink-0">
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
            ) : null }
          </div>
        </div>
      </div>
    </div>
  );
}

UserProfileHeader.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
    coverUrl: PropTypes.string,
    createdAt: PropTypes.string,
    postCount: PropTypes.number,
    friendCount: PropTypes.number,
    friendship: PropTypes.shape({
        _id: PropTypes.string,
        from: PropTypes.string,
        to: PropTypes.string,
        status: PropTypes.string,
        createdAt: PropTypes.string,
    }),
  }),
};

export default UserProfileHeader; 