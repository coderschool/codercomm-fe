import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  UserCircle, 
  Share 
} from "lucide-react";
import AccountGeneral from "@/features/user/AccountGeneral";
import AccountSocialLinks from "@/features/user/AccountSocialLinks";

function AccountPage() {
  const [currentTab, setCurrentTab] = useState("general");

  const ACCOUNT_TABS = [
    {
      value: "general",
      icon: <UserCircle className="w-5 h-5" />,
      component: <AccountGeneral />,
      label: "General"
    },
    {
      value: "social_links",
      icon: <Share className="w-5 h-5" />,
      component: <AccountSocialLinks />,
      label: "Social Links"
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Account Settings
      </h1>

      <Tabs defaultValue="general" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-8">
          {ACCOUNT_TABS.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex items-center"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {ACCOUNT_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default AccountPage;