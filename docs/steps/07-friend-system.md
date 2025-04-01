# Step 7: Friend System

In this step, we'll implement a simplified friend system for the CoderComm application. This will allow users to view their friends, add new friends, and manage friendships directly in the HomePage tabs.

## 1. Understanding the Mock API Endpoints for Friends

Our mock API already includes all the endpoints we need for the friend system. For this step, we'll be using the following endpoints:

- `GET /friends` - Get the current user's friends
- `GET /users` - Get users for finding new friends
- `POST /friends/requests` - Send a friend request
- `PUT /friends/requests/:userId` - Accept or decline a friend request
- `DELETE /friends/requests/:userId` - Cancel a friend request
- `DELETE /friends/:userId` - Remove a friendship (unfriend)

## 2. Create Friend Service with React Query Hooks

Let's create hooks to handle friend-related API calls. Create a new file `src/features/friend/friendHooks.js`:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '../../lib/apiService';
import { USERS_PER_PAGE } from '../../lib/config';
import { getPaginationParams } from '../../lib/utils';

/**
 * Get all users for user discovery
 * @param {string} filterName - Name to filter users by
 * @param {number} page - Page number
 * @returns {Object} Query result with users and pagination
 */
export const useGetUsers = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['users', 'discover', filterName, page],
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: USERS_PER_PAGE, 
        filter: filterName 
      });
      
      const response = await apiService.get('/users', { params });
      return response;
    },
  });
};

/**
 * Get current user's friends
 * @param {string} filterName - Name to filter friends by
 * @param {number} page - Page number
 * @returns {Object} Query result with friends and pagination
 */
export const useGetFriends = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', filterName, page],
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: USERS_PER_PAGE, 
        filter: filterName 
      });
      
      const response = await apiService.get('/friends', { params });
      return response;
    },
  });
};

/**
 * Send a friend request
 * @returns {Object} Mutation result
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.post('/friends/requests', {
        to: targetUserId,
      });
      
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request sent');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });
};

/**
 * Accept a friend request
 * @returns {Object} Mutation result
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.put(`/friends/requests/${targetUserId}`, {
        status: 'accepted',
      });
      
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request accepted');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });
};

/**
 * Decline a friend request
 * @returns {Object} Mutation result
 */
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.put(`/friends/requests/${targetUserId}`, {
        status: 'declined',
      });
      
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request declined');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to decline friend request');
    },
  });
};

/**
 * Cancel a friend request
 * @returns {Object} Mutation result
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.delete(`/friends/requests/${targetUserId}`);
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend request cancelled');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel friend request');
    },
  });
};

/**
 * Remove a friend
 * @returns {Object} Mutation result
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId) => {
      const response = await apiService.delete(`/friends/${targetUserId}`);
      return { ...response, targetUserId };
    },
    onSuccess: (data) => {
      toast.success('Friend removed');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove friend');
    },
  });
};
```

## 3. Create the User Card Component

Next, let's create a reusable component to display a user card with friend actions. Create a file `src/features/friend/UserCard.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Clock } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import ActionButton from "./ActionButton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/utils/formatTime";

function UserCard({ profile, requestStatus }) {
  const { user } = useAuth();
  const currentUserId = user._id;
  const { _id: targetUserId, name, avatarUrl, email, friendship } = profile;

  const actionButton = (
    <ActionButton
      currentUserId={currentUserId}
      targetUserId={targetUserId}
      friendship={friendship}
    />
  );

  return (
    <Card className="flex flex-col p-3">
      <div className="flex items-center w-full">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0 pl-2 pr-1">
          <Link
            to={`/user/${targetUserId}`}
            className="font-semibold text-sm hover:underline"
          >
            {name}
          </Link>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              {email}
            </p>
          </div>
        </div>
        {actionButton}
      </div>
      
      {friendship && friendship.status === "pending" && friendship.createdAt && (
        <div className="ml-14 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Request {friendship.from === currentUserId ? "sent" : "received"} {formatTimeAgo(friendship.createdAt)}
          </p>
        </div>
      )}
    </Card>
  );
}

export default UserCard;
```

## 4. Create the Action Button Component

Now, let's create a component for handling friend actions (send request, accept/decline, unfriend). Create a file `src/features/friend/ActionButton.jsx`:

```jsx
import React from "react";
import { 
  useSendFriendRequest, 
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend
} from "./friendHooks";
import { Button } from "@/components/ui/button";

function ActionButton({ currentUserId, targetUserId, friendship, className }) {
  const sendRequestMutation = useSendFriendRequest();
  const acceptRequestMutation = useAcceptFriendRequest();
  const declineRequestMutation = useDeclineFriendRequest();
  const cancelRequestMutation = useCancelFriendRequest();
  const removeFriendMutation = useRemoveFriend();

  if (currentUserId === targetUserId) return null;

  const btnSendRequest = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      onClick={() => sendRequestMutation.mutate(targetUserId)}
      disabled={sendRequestMutation.isPending}
    >
      {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
    </Button>
  );

  if (!friendship) return btnSendRequest;

  const btnUnfriend = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      variant="destructive"
      onClick={() => removeFriendMutation.mutate(targetUserId)}
      disabled={removeFriendMutation.isPending}
    >
      {removeFriendMutation.isPending ? "Removing..." : "Unfriend"}
    </Button>
  );
  
  const btnResend = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      onClick={() => sendRequestMutation.mutate(targetUserId)}
      disabled={sendRequestMutation.isPending}
    >
      {sendRequestMutation.isPending 
        ? "Sending..." 
        : `${friendship.from === currentUserId ? "Resend" : "Send"} Request`}
    </Button>
  );
  
  const btnCancelRequest = (
    <Button
      className={`text-xs ${className}`}
      size="sm"
      variant="destructive"
      onClick={() => cancelRequestMutation.mutate(targetUserId)}
      disabled={cancelRequestMutation.isPending}
    >
      {cancelRequestMutation.isPending ? "Canceling..." : "Cancel Request"}
    </Button>
  );
  
  const btnGroupReact = (
    <div className="flex flex-row gap-1">
      <Button
        className={`text-xs ${className}`}
        size="sm"
        variant="default"
        onClick={() => acceptRequestMutation.mutate(targetUserId)}
        disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
      >
        {acceptRequestMutation.isPending ? "Accepting..." : "Accept"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-xs text-destructive border-destructive hover:bg-destructive/10"
        onClick={() => declineRequestMutation.mutate(targetUserId)}
        disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
      >
        {declineRequestMutation.isPending ? "Declining..." : "Decline"}
      </Button>
    </div>
  );

  if (friendship.status === "accepted") {
    return btnUnfriend;
  }

  if (friendship.status === "declined") {
    return btnResend;
  }

  if (friendship.status === "pending") {
    const { from, to } = friendship;
    if (from === currentUserId && to === targetUserId) {
      return btnCancelRequest;
    } else if (from === targetUserId && to === currentUserId) {
      return btnGroupReact;
    }
  }

  return btnSendRequest;
}

export default ActionButton;
```

## 5. Create the FriendList Component

Create a component to display the current user's friends list in `src/features/friend/FriendList.jsx`:

```jsx
import React, { useState } from "react";
import { useGetFriends } from "./friendHooks";
import UserCard from "./UserCard";
import SearchInput from "@/components/SearchInput";
import { Card } from "@/components/ui/card";

function FriendList() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetFriends(filterName, page);
  
  // Extract data safely with proper defaults
  const users = data?.users || [];
  const totalUsers = data?.totalUsers || 0;
  const totalPages = data?.totalPages || 1;

  const handleSubmit = (searchQuery) => {
    setFilterName(searchQuery);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <SearchInput handleSubmit={handleSubmit} />
          
          <div className="flex-grow" />
          
          <p className="text-sm text-muted-foreground ml-1">
            {totalUsers > 1
              ? `${totalUsers} friends found`
              : totalUsers === 1
              ? `${totalUsers} friend found`
              : "No friend found"}
          </p>
          
          <div className="flex justify-center">
            <nav aria-label="Pagination" className="inline-flex -space-x-px text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`${
                    pageNum === page
                      ? "bg-primary text-white"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  } px-3 py-2 border border-gray-300 first:rounded-l-md last:rounded-r-md`}
                >
                  {pageNum}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        {isLoading ? (
          <p className="text-center col-span-3">Loading...</p>
        ) : (
          users.map((user) => (
            <div key={user._id}>
              <UserCard profile={user} />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default FriendList;
```

## 6. Create the AddFriend Component

Create a component to find and add new friends in `src/features/friend/AddFriend.jsx`:

```jsx
import React, { useState } from "react";
import { useGetUsers } from "./friendHooks";
import UserCard from "./UserCard";
import SearchInput from "@/components/SearchInput";
import { Card } from "@/components/ui/card";

function AddFriend() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetUsers(filterName, page);
  
  // Extract data safely with proper defaults
  const users = data?.users || [];
  const totalUsers = data?.totalUsers || 0;
  const totalPages = data?.totalPages || 1;

  const handleSubmit = (searchQuery) => {
    setFilterName(searchQuery);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <SearchInput handleSubmit={handleSubmit} placeholder="Search for users..." />
          
          <div className="flex-grow" />
          
          <p className="text-sm text-muted-foreground ml-1">
            {totalUsers > 1
              ? `${totalUsers} users found`
              : totalUsers === 1
              ? `${totalUsers} user found`
              : "No users found"}
          </p>
          
          <div className="flex justify-center">
            <nav aria-label="Pagination" className="inline-flex -space-x-px text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`${
                    pageNum === page
                      ? "bg-primary text-white"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  } px-3 py-2 border border-gray-300 first:rounded-l-md last:rounded-r-md`}
                >
                  {pageNum}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        {isLoading ? (
          <p className="text-center col-span-3">Loading...</p>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div key={user._id}>
              <UserCard profile={user} />
            </div>
          ))
        ) : (
          <p className="text-center col-span-3">No users found matching your search.</p>
        )}
      </div>
    </Card>
  );
}

export default AddFriend;
```

## 7. Update HomePage to Include Friend System Tabs

Update the HomePage component to include tabs for the friend system:

```jsx
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
```

## 8. Testing the Friend System

You can now test your friend system by navigating to the Home page and using the tabs:

1. View your profile in the "Profile" tab
2. See your existing friends in the "Friends" tab
3. Find and add new friends in the "Add Friend" tab
4. Test various friend actions like sending requests, accepting/declining, and unfriending

The system will handle all these actions smoothly with appropriate feedback via toast messages. 