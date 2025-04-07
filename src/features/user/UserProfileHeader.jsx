import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Calendar } from 'lucide-react';
import { getInitials } from '@/utils/formatters'; // Import utility
// Removed toast import as friend button is not here

/**
 * Reusable User Profile Header Component.
 * Displays the logged-in user's profile summary header (cover, avatar, name, counts).
 * Gets currentUser from the store.
 */
function UserProfileHeader() { // Renamed component
  const navigate = useNavigate();
  const { currentUser } = useAppStore((state) => ({
    currentUser: state.currentUser,
  }));

  // Handle loading state
  if (!currentUser) {
    return (
      // Simple height placeholder during load to prevent layout shift
      <div className="h-[268px] md:h-[300px] flex items-center justify-center bg-muted rounded-lg mb-8">
        Loading profile header...
      </div>
    );
  }

  const handleEditClick = () => {
    navigate('/profile/me/edit'); 
  };

  return (
    // Added mb-8 for spacing below the header
    <div className="space-y-8 mb-8">
      {/* --- Profile Header Section --- */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted">
          {currentUser.coverUrl ? (
            <img
              src={currentUser.coverUrl}
              alt={`${currentUser.name}'s cover photo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary/50" />
          )}
        </div>

        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background bg-background">
            <AvatarImage src={currentUser.avatarUrl || ''} alt={currentUser.name} />
            <AvatarFallback className="text-4xl">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="ml-0 sm:ml-4 mt-2 sm:mb-2 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">{currentUser.name}</h1>
            {/* Join Date */}
            {currentUser.createdAt && (
               <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground mt-1">
                 <Calendar className="h-4 w-4 mr-1.5" />
                 <span>
                   Joined {formatDistanceToNow(new Date(currentUser.createdAt), { addSuffix: true })}
                 </span>
               </div>
            )}
             {/* Display Counts */}
             <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-muted-foreground mt-2">
                <span><strong>{currentUser.postCount ?? 0}</strong> Posts</span>
                <span><strong>{currentUser.friendCount ?? 0}</strong> Friends</span>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-auto mt-4 sm:mt-0 sm:mb-2">
             <Button 
                onClick={handleEditClick} 
                variant="default"
                size="sm"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileHeader; // Updated export 