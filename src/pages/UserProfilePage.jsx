import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import UserProfileHeader from '@/features/user/UserProfileHeader'; // Use the updated header
import PostList from '@/features/post/PostList'; // Use the updated list
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function UserProfilePage() {
  const { userId } = useParams(); // Get userId from route params

  // Select state and actions from Zustand store
  const { profileState, fetchUserProfile } = useAppStore(
    (state) => ({
      profileState: state.userProfiles[userId],
      fetchUserProfile: state.fetchUserProfile,
    })
  );

  // Fetch profile when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  const profile = profileState?.data;
  const isLoadingProfile = profileState?.isLoading ?? true; // Assume loading initially if no state
  const profileError = profileState?.error;

  // --- Render Logic ---

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profileError) {
      return (
          <Alert variant="destructive" className="mt-4 max-w-xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>
                  {profileError || "Could not load user profile. Please try again later."}
              </AlertDescription>
          </Alert>
        );
  }

   // Handle case where loading finished but no profile data was found (404)
   if (!profile) {
       return (
          <Alert variant="secondary" className="mt-4 max-w-xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>User Not Found</AlertTitle>
              <AlertDescription>
                  The user profile you are looking for does not exist.
              </AlertDescription>
          </Alert>
       );
   }

  // If profile loaded successfully, render header and post list
  return (
    <div className="space-y-6">
       {/* Pass the fetched profile data to the header */}
       <UserProfileHeader user={profile} />

       {/* Add a divider or heading for posts */}
       <div className="container mx-auto px-4">
          {/* Center the PostList similar to the Feed */}
          <div className="max-w-xl mx-auto"> 
             <PostList userId={userId} />
          </div>
       </div>
    </div>
  );
}

export default UserProfilePage; 