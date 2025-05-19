import React, { useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  Search,
  User,
  Settings,
  Hash,
  Users,
  Handshake,
  Clock,
  Search as SearchIcon,
} from "lucide-react";

import PostList from "@/features/post/PostList";
import PostForm from "@/features/post/PostForm";
import { usePosts } from "@/features/post/postStore";
import { useAuth } from "@/features/auth/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Input } from "@/components/ui/input";

const trendingTopics = [
  { topic: "React", posts: "25.4K posts" },
  { topic: "JavaScript", posts: "18.2K posts" },
  { topic: "TypeScript", posts: "12.8K posts" },
  { topic: "Web Development", posts: "9.5K posts" },
];

const suggestedUsers = [
  { id: 1, name: "Sarah Johnson", avatarUrl: "" },
  { id: 2, name: "Mike Chen", avatarUrl: "" },
  { id: 3, name: "Emma Wilson", avatarUrl: "" },
];

function HomePage() {
  const { currentUser } = useAuth();
  const { fetchUserPosts } = usePosts();

  const navItems = useMemo(
    () => [
      { icon: Search, label: "Explore", href: "/explore" },
      { icon: User, label: "Profile", href: `/users/${currentUser._id}` },
      { icon: Handshake, label: "Requests", href: "/friend-requests" },
      { icon: Users, label: "Friends", href: "/friends" },
      { icon: Settings, label: "Settings", href: "/account" },
    ],
    [currentUser._id]
  );

  useEffect(() => {
    fetchUserPosts(currentUser._id);
  }, [currentUser._id, fetchUserPosts]);

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
      <div className="flex-1 flex flex-col gap-4">
        <PostForm />
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Your Feed</h2>
          <PostList />
        </div>
      </div>

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
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>

                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
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
