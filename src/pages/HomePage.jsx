import React, { useState } from "react";
import useAuth from "../hooks/useAuth";

import { 
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui";
import { User, UserPlus, Mail, Users } from "lucide-react";

import Profile from "../features/user/Profile";
import ProfileCover from "../features/user/ProfileCover";
import AddFriend from "../features/friend/AddFriend";
import FriendRequests from "../features/friend/FriendRequests";
import FriendList from "../features/friend/FriendList";

/**
 * HomePage - The main authenticated user home page
 * Displays the user profile and tabs for friends management
 */
function HomePage() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");

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
      value: "requests",
      icon: <Mail className="w-5 h-5" />,
      component: <FriendRequests />,
      label: "Requests"
    },
    {
      value: "add_friend",
      icon: <UserPlus className="w-5 h-5" />,
      component: <AddFriend />,
      label: "Add Friend"
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <Card className="mb-6 h-72 relative">
        <ProfileCover profile={user} />

        <div className="absolute bottom-0 w-full flex justify-center md:justify-end md:pr-6 bg-white z-10">
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
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {PROFILE_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

export default HomePage;