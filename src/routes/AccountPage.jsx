import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/authStore";

function AccountPage() {
  const { currentUser, loading } = useAuth();

  // Display loading state if currentUser isn't available yet
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your basic profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Avatar and Name/Email */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage
                src={currentUser.avatarUrl || ""}
                alt={currentUser.name}
              />
              <AvatarFallback className="text-xl">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-lg font-semibold truncate">{currentUser.name}</p>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {/* Add other read-only fields if desired (City, Country, Company, Job) */}
            {(currentUser.city || currentUser.country) && (
              <div>
                <p className="font-medium text-muted-foreground">Location</p>
                <p>
                  {currentUser.city}
                  {currentUser.city && currentUser.country && ", "}
                  {currentUser.country}
                </p>
              </div>
            )}
            {(currentUser.jobTitle || currentUser.company) && (
              <div>
                <p className="font-medium text-muted-foreground">Work</p>
                <p>
                  {currentUser.jobTitle}
                  {currentUser.jobTitle && currentUser.company && " at "}
                  {currentUser.company}
                </p>
              </div>
            )}
          </div>

          {/* About Me Section */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              About Me
            </p>
            <p className="text-sm text-muted-foreground italic mt-1">
              {currentUser.aboutMe || "No bio provided."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Other Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Socials</CardTitle>
          <CardDescription>Add your social media links here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Further settings management will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountPage;
