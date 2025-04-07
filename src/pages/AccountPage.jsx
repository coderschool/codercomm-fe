import React from "react";
// import useAuth from "@/hooks/useAuth"; // Removed
import { useAppStore } from "@/lib/store"; // Added
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/formatters";

/**
 * Account Settings Page (Placeholder)
 * Displays basic user info. Actual editing will be added later.
 */
function AccountPage() {
  // Get user from Zustand store
  const { currentUser } = useAppStore((state) => ({
    currentUser: state.currentUser,
  }));

  if (!currentUser) {
    // Should ideally not happen if AuthRequire works, but good practice
    return <div>Loading user data...</div>; 
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Basic profile details. Editing coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={currentUser.avatarUrl || ''} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p>{currentUser.username || "N/A"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">About Me</p>
            <p className="text-muted-foreground italic">
              {currentUser.aboutMe || "No bio provided."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for other settings */}
      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
          <CardDescription>Password change, notifications, etc. (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">Settings management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountPage;