import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import Feed from "@/features/post/Feed";
import FriendsPage from "@/pages/FriendsPage"; 
import FriendRequestsPage from "@/pages/FriendRequestsPage"; 
import UserProfileHeader from "@/features/user/UserProfileHeader"; 

/**
 * Home Page Component:
 * Displays the current user's profile cover and provides tabs for Feed,
 * Friends, and Requests.
 */
function HomePage() {
  // Get user from Zustand store
  const { user } = useAppStore((state) => ({
    user: state.currentUser,
  }));
  const [currentTab, setCurrentTab] = useState("feed"); // Default to feed

  if (!user) {
    console.error("HomePage rendered without a user after AuthRequire.");
    return (
      <div className="container mx-auto px-4 pt-4 text-center text-destructive">
        Error: User data not available. Please try refreshing or logging in again.
      </div>
    );
  }

  const TABS = [
    { value: "feed", label: "Feed", component: Feed },
    { value: "friends", label: "Friends", component: FriendsPage },
    { value: "requests", label: "Requests", component: FriendRequestsPage },
  ];

  return (
    <div className="container mx-auto px-4 pt-4">
      {/* Render the UserProfileHeader above the tabs */}
      <UserProfileHeader />
      
      {/* Tabs Navigation */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-6">
        {/* Sticky TabsList remains the same */}
        <div className="flex justify-center sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b -mx-4 px-4 py-2 mb-6">
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content - Rendered directly */}
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <tab.component {...tab.props} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default HomePage;
