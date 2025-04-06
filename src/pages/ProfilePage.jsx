import React, { useState } from "react";
import { useParams } from "react-router-dom"; // Hook to get URL parameters
import { useUserQuery, useUserPosts } from "@/hooks/useUserQuery"; // Our data hooks
import useAuth from "@/hooks/useAuth"; // To check if it's the current user's profile
import { formatDistanceToNow } from "date-fns"; // For relative date formatting

// ShadCN UI Components
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // For errors
import { Pencil, UserPlus, UserMinus, Calendar, AlertCircle } from "lucide-react"; // Icons

// Feature Components (We'll create these next)
import ProfileAbout from "@/features/user/ProfileAbout";
import ProfileEditForm from "@/features/user/ProfileEditForm";
import PostList from "@/features/post/PostList"; // Re-use PostList
import LoadingScreen from "@/components/LoadingScreen";

// Utilities
import { getInitials } from "@/utils/formatters"; // Import utility

/**
 * User Profile Page: Displays user information, posts, about section, etc.
 * Handles fetching data via React Query hooks and allows editing for the current user.
 */
function ProfilePage() {
  // Get the user ID from the URL (e.g., /user/user1 -> id = "user1")
  const { userId } = useParams(); 
  // Get the currently logged-in user from our auth hook
  const { user: currentUser } = useAuth();
  // State to toggle the profile editing form
  const [isEditing, setIsEditing] = useState(false);
  
  // --- Data Fetching using React Query ---
  // Fetch the profile user's data
  const { 
    data: profileUser, // Renamed data to profileUser for clarity
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError
  } = useUserQuery(userId); // Pass the userId from the URL
  
  // Fetch the posts for this profile user
  const { 
    data: postsData, // Contains { posts: [], count: X, totalPages: Y }
    isLoading: isLoadingPosts,
    // We could add error handling for posts too if needed
  } = useUserPosts(userId); // Pass the same userId

  // --- Computed State ---
  // Check if the profile being viewed belongs to the currently logged-in user
  const isCurrentUserProfile = currentUser?._id === userId;

  // --- Render Logic ---

  // Handle loading state for the user profile
  if (isLoadingUser) {
    return <LoadingScreen message="Loading profile..." />;
  }

  // Handle error state for the user profile
  if (isUserError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Profile</AlertTitle>
        <AlertDescription>
          {userError?.message || "An unexpected error occurred."}
        </AlertDescription>
      </Alert>
    );
  }
  
  // If data loaded but user is not found (e.g., invalid ID)
  if (!profileUser) {
     return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>User Not Found</AlertTitle>
         <AlertDescription>
           The profile for this user could not be found.
         </AlertDescription>
       </Alert>
     );
  }

  // --- JSX Structure ---
  return (
    <div className="space-y-8">
      {/* --- Profile Header Section --- */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted">
          {profileUser.coverUrl ? (
            <img
              src={profileUser.coverUrl}
              alt={`${profileUser.name}'s cover photo`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Placeholder gradient if no cover image
            <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary/50" />
          )}
        </div>

        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background bg-background">
            <AvatarImage src={profileUser.avatarUrl || ''} alt={profileUser.name} />
            <AvatarFallback className="text-4xl">
              {getInitials(profileUser.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="ml-0 sm:ml-4 mt-2 sm:mb-2 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">{profileUser.name}</h1>
            {/* Join Date - Using date-fns for formatting */}
            {profileUser.createdAt && (
               <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground mt-1">
                 <Calendar className="h-4 w-4 mr-1.5" />
                 <span>
                   Joined {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })}
                 </span>
               </div>
            )}
          </div>

          {/* Action Buttons (Edit/Add Friend) */}
          <div className="ml-auto mt-4 sm:mt-0 sm:mb-2">
            {isCurrentUserProfile ? (
              // Show Edit/Cancel button if it's the current user's profile
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant={isEditing ? "outline" : "default"}
                size="sm"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>
            ) : (
              // Show Add/Remove Friend button for other profiles (functionality later)
              <Button size="sm" onClick={() => toast.info("Friend actions coming soon!")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend 
                {/* Add logic here later based on friendship status */}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- Profile Content Tabs --- */}
      <Tabs defaultValue="posts" className="w-full">
        {/* Tab Triggers */}
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts">Posts ({profileUser.postCount || 0})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="friends">Friends ({profileUser.friendCount || 0})</TabsTrigger>
          {/* <TabsTrigger value="photos">Photos</TabsTrigger> */}
        </TabsList>
        
        {/* Posts Tab Content */}
        <TabsContent value="posts">
          {isLoadingPosts ? (
            <LoadingScreen message="Loading posts..." fullScreen={false} />
          ) : (
            // Pass the fetched posts array to the PostList component
            <PostList posts={postsData?.posts || []} /> 
          )}
        </TabsContent>
        
        {/* About Tab Content */}
        <TabsContent value="about">
          {/* Show edit form only if `isEditing` is true AND it's the current user's profile */}
          {isEditing && isCurrentUserProfile ? (
            <ProfileEditForm 
              user={profileUser} 
              // Pass callbacks to close the form on cancel/success
              onCancel={() => setIsEditing(false)} 
              onSuccess={() => setIsEditing(false)} 
            />
          ) : (
            // Otherwise, show the read-only About component
            <ProfileAbout user={profileUser} />
          )}
        </TabsContent>
        
        {/* Friends Tab Content (Placeholder) */}
        <TabsContent value="friends">
          <Card className="mt-4">
            <CardHeader><CardTitle>Friends</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Friends list feature coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Photos Tab Content (Placeholder) */}
        {/* <TabsContent value="photos">
          <Card className="mt-4">
            <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
            <CardContent>
               <p className="text-center text-muted-foreground py-8">
                 Photos gallery feature coming soon!
               </p>
             </CardContent>
           </Card>
         </TabsContent> */}
      </Tabs>
    </div>
  );
}

export default ProfilePage; 