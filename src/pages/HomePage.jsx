import React, { useState } from "react";
import useAuth from "@/hooks/useAuth";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, UserPlus, Users } from "lucide-react";

import Profile from "@/features/user/Profile";
import ProfileCover from "@/features/user/ProfileCover";
import AddFriend from "@/features/friend/AddFriend";
import FriendList from "@/features/friend/FriendList";

/**
 * HomePage - The main authenticated user home page
 * Displays the user profile and tabs for friends management
 */
function HomePage() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");

  // Show loading state if user data is not yet available
  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <Card className="mb-6 h-60 md:h-80 relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-muted"></div>
          <div className="absolute bottom-0 left-0 right-0 w-full bg-white z-10 py-4">
            <div className="flex justify-center">
              <div className="h-8 w-32 bg-muted rounded"></div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  const PROFILE_TABS = [
    {
      value: "profile",
      icon: <User className="w-5 h-5" />,
      component: <Profile profile={user} />,
      label: "Profile"
    },
    {
      value: "friends",
      icon: <Users className="w-5 h-5" />,
      component: <FriendList />,
      label: "Friends"
    },
    {
      value: "add_friend",
      icon: <UserPlus className="w-5 h-5" />,
      component: <AddFriend />,
      label: "Add Friend"
    },
  ];

  return (
    <div className="container mx-auto px-4 pt-4">
      {/* Cover and tabs card */}
      <Card className="mb-6 h-60 md:h-80 relative overflow-hidden">
        <ProfileCover profile={user} />

        <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center md:justify-end md:pr-6 bg-white/90 backdrop-blur-sm shadow-sm z-10 py-1">
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="w-full md:w-auto bg-transparent">
              {PROFILE_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Tab content in a separate card */}
      <Card className="p-6">
        <Tabs value={currentTab} className="w-full">
          {PROFILE_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}

export default HomePage;