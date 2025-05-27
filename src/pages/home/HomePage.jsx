import React from "react";
import { Link } from "react-router";
import { Search, User, Settings, Hash, Users, Handshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initials";
import HomePostSection from "./HomePostSection";
import { PostStoreProvider } from "@/features/post/PostStoreProvider";

const trendingTopics = [
  { topic: "React", posts: "25.4K posts" },
  { topic: "JavaScript", posts: "18.2K posts" },
  { topic: "TypeScript", posts: "12.8K posts" },
  { topic: "Web Development", posts: "9.5K posts" },
];

const navItems = [
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: User, label: "Profile", href: `/users/me` },
  { icon: Handshake, label: "Requests", href: "/friend-requests" },
  { icon: Users, label: "Friends", href: "/friends" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const SUGGESTED_USERS = [
  { _id: "coderschool", name: "Coderschool" },
  { _id: "youni", name: "Youni" },
];

function HomePage() {
  return (
    <div className="container flex gap-4 py-6">
      {/* Left Sidebar */}
      <div className="w-64 flex flex-col h-[calc(100vh-10rem)] sticky top-20">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start gap-4 h-12"
              asChild
            >
              <Link to={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="text-lg">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <PostStoreProvider>
        <HomePostSection />
      </PostStoreProvider>

      {/* Right Sidebar */}
      <div className="w-80 flex flex-col h-[calc(100vh-10rem)] sticky top-20 px-4">
        <div className="flex flex-col gap-6">
          {/* Trending Topics */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Trending Topics</h3>
            {trendingTopics.map((topic) => (
              <div key={topic.topic} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{topic.topic}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {topic.posts}
                </span>
              </div>
            ))}
          </div>

          {/* Suggested Users */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">You May Know</h3>
            <div className="flex flex-col gap-3">
              {SUGGESTED_USERS.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Link to={`/users/${user._id}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <Link to={`/users/${user._id}`}>
                      <span className="font-medium text-sm">{user.name}</span>
                    </Link>
                  </div>
                  <Button variant="outline" size="sm">
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
