import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import PersonalDetailForm from "@/features/settings/PersonalDetailForm";
import SocialDetailForm from "@/features/settings/SocialDetailForm";
import { useAuthState } from "@/lib/auth/useAuth";

function SettingsPage() {
  const { currentUser } = useAuthState();

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <PersonalDetailForm currentUser={currentUser} />
        </CardContent>
      </Card>

      {/* Socials Card */}
      <Card>
        <CardHeader>
          <CardTitle>Socials</CardTitle>
          <CardDescription>Add your social media links here.</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialDetailForm currentUser={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
