# Step 7: Friend System

In this step, we'll implement the friend system for the CoderComm application. This will allow users to send friend requests, accept or decline them, and view their friends list.

## 1. Understanding the Mock API Endpoints for Friends

Our mock API already includes all the endpoints we need for the friend system. For this step, we'll be using the following endpoints:

- `GET /api/users/:userId/friends` - Get the friends of a user
- `GET /api/users/:userId/friend-requests/incoming` - Get incoming friend requests
- `GET /api/users/:userId/friend-requests/outgoing` - Get outgoing friend requests
- `POST /api/friend-requests` - Send a friend request
- `PATCH /api/friend-requests/:id` - Accept or decline a friend request
- `DELETE /api/friendships/:id` - Delete a friendship (unfriend)

Remember that you don't need to modify the mock API - it's already set up with all the functionality we need. We just need to create the frontend components to interact with these endpoints.

## 2. Create Friend Service with React Query Hooks

Create a new file `src/hooks/useFriendQuery.js`:

```jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/apiService";
import { toast } from "sonner";

/**
 * Get friends of a user
 * @param {string} userId - ID of the user to get friends for
 */
export function useFriendsQuery(userId) {
  return useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const response = await apiService.get(`/users/${userId}/friends`);
      return response;
    },
    enabled: !!userId,
  });
}

/**
 * Get incoming friend requests for a user
 * @param {string} userId - ID of the user to get friend requests for
 */
export function useIncomingFriendRequestsQuery(userId) {
  return useQuery({
    queryKey: ["friendRequests", "incoming", userId],
    queryFn: async () => {
      const response = await apiService.get(`/users/${userId}/friend-requests/incoming`);
      return response;
    },
    enabled: !!userId,
  });
}

/**
 * Get outgoing friend requests for a user
 * @param {string} userId - ID of the user to get outgoing requests for
 */
export function useOutgoingFriendRequestsQuery(userId) {
  return useQuery({
    queryKey: ["friendRequests", "outgoing", userId],
    queryFn: async () => {
      const response = await apiService.get(`/users/${userId}/friend-requests/outgoing`);
      return response;
    },
    enabled: !!userId,
  });
}

/**
 * Send a friend request
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requesterId, recipientId }) => {
      const response = await apiService.post("/friend-requests", {
        requesterId,
        recipientId,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request sent");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send friend request");
    },
  });
}

/**
 * Accept or decline a friend request
 */
export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }) => {
      const response = await apiService.patch(`/friend-requests/${requestId}`, {
        status,
      });
      return { ...response, status };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      
      if (data.status === "accepted") {
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        toast.success("Friend request accepted");
      } else {
        toast.success("Friend request declined");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process friend request");
    },
  });
}

/**
 * Remove a friend
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId) => {
      const response = await apiService.delete(`/friendships/${friendshipId}`);
      return response;
    },
    onSuccess: () => {
      // Invalidate friends query
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove friend");
    },
  });
}
```

## 3. Add UI Components for Friend System

Let's create components for displaying friends and friend requests.

First, create a component for the Friends page in `src/pages/FriendsPage.jsx`:

```jsx
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import FriendsList from "@/features/friend/FriendsList";
import FriendRequests from "@/features/friend/FriendRequests";

/**
 * Page for displaying and managing friends
 */
function FriendsPage() {
  const { user } = useAuth();

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>
      
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends" className="space-y-4">
          <FriendsList userId={user?._id} />
        </TabsContent>
        
        <TabsContent value="requests" className="space-y-4">
          <FriendRequests userId={user?._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FriendsPage;
```

Next, create a component for displaying the friends list in `src/features/friend/FriendsList.jsx`:

```jsx
import React from "react";
import { useFriendsQuery, useRemoveFriend } from "@/hooks/useFriendQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Component to display a list of friends
 * @param {Object} props - Component props
 * @param {string} props.userId - ID of the user to display friends for
 */
function FriendsList({ userId }) {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useFriendsQuery(userId);
  
  const removeFriend = useRemoveFriend();

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRemoveFriend = (friendshipId) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      removeFriend.mutate(friendshipId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded">
        <p>Error loading friends: {error.message || "Something went wrong"}</p>
      </div>
    );
  }

  const friends = data?.friends || [];

  if (friends.length === 0) {
    return (
      <div className="bg-card p-8 rounded-lg text-center">
        <p className="text-muted-foreground mb-4">You don't have any friends yet.</p>
        <Button asChild>
          <Link to="/friend-requests">Find Friends</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {friends.map((friend) => (
        <div 
          key={friend._id}
          className="flex items-center justify-between bg-card p-4 rounded-lg"
        >
          <div className="flex items-center">
            <Link to={`/user/${friend._id}`}>
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
              </Avatar>
            </Link>
            
            <div>
              <Link
                to={`/user/${friend._id}`}
                className="font-medium hover:underline"
              >
                {friend.name}
              </Link>
              <p className="text-sm text-muted-foreground">{friend.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleRemoveFriend(friend._id)}
            title="Remove friend"
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default FriendsList;
```

Now, create a component for displaying friend requests in `src/features/friend/FriendRequests.jsx`:

```jsx
import React from "react";
import { 
  useIncomingFriendRequestsQuery,
  useOutgoingFriendRequestsQuery,
  useRespondToFriendRequest
} from "@/hooks/useFriendQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

/**
 * Component to display incoming and outgoing friend requests
 * @param {Object} props - Component props
 * @param {string} props.userId - ID of the user to display requests for
 */
function FriendRequests({ userId }) {
  const incoming = useIncomingFriendRequestsQuery(userId);
  const outgoing = useOutgoingFriendRequestsQuery(userId);
  const respondToRequest = useRespondToFriendRequest();

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAccept = (requestId) => {
    respondToRequest.mutate({
      requestId,
      status: "accepted",
    });
  };

  const handleDecline = (requestId) => {
    respondToRequest.mutate({
      requestId,
      status: "declined",
    });
  };

  if (incoming.isLoading || outgoing.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (incoming.isError || outgoing.isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded">
        <p>
          Error loading friend requests: 
          {(incoming.error || outgoing.error)?.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  const incomingRequests = incoming.data?.requests || [];
  const outgoingRequests = outgoing.data?.requests || [];

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="bg-card p-8 rounded-lg text-center">
        <p className="text-muted-foreground">You don't have any friend requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {incomingRequests.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium">Incoming Requests</h2>
            <Badge variant="secondary" className="ml-2">
              {incomingRequests.length}
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {incomingRequests.map((request) => (
              <div 
                key={request._id}
                className="flex items-center justify-between bg-card p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <Link to={`/user/${request.requester._id}`}>
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={request.requester.avatarUrl} alt={request.requester.name} />
                      <AvatarFallback>{getInitials(request.requester.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div>
                    <Link
                      to={`/user/${request.requester._id}`}
                      className="font-medium hover:underline"
                    >
                      {request.requester.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="icon"
                    className="text-green-500"
                    onClick={() => handleAccept(request._id)}
                    disabled={respondToRequest.isPending}
                    title="Accept"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDecline(request._id)}
                    disabled={respondToRequest.isPending}
                    title="Decline"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {outgoingRequests.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium">Outgoing Requests</h2>
            <Badge variant="secondary" className="ml-2">
              {outgoingRequests.length}
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {outgoingRequests.map((request) => (
              <div 
                key={request._id}
                className="flex items-center justify-between bg-card p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <Link to={`/user/${request.recipient._id}`}>
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={request.recipient.avatarUrl} alt={request.recipient.name} />
                      <AvatarFallback>{getInitials(request.recipient.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div>
                    <Link
                      to={`/user/${request.recipient._id}`}
                      className="font-medium hover:underline"
                    >
                      {request.recipient.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Pending</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FriendRequests;
```

## 4. Update the User Profile to Add Friend Functionality

Now, let's update the user profile to add the ability to send friend requests. Modify `src/pages/ProfilePage.jsx`:

```jsx
import React from "react";
import { useParams } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useUserByIdQuery, useUserPostsQuery } from "@/hooks/useUserQuery";
import { useFriendsQuery, useSendFriendRequest } from "@/hooks/useFriendQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingScreen from "@/components/LoadingScreen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import ProfileAbout from "@/features/user/ProfileAbout";
import ProfileEditForm from "@/features/user/ProfileEditForm";
import PostList from "@/features/post/PostList";

/**
 * User profile page component
 */
function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isCurrentUser = id === currentUser?._id;
  const [isEditing, setIsEditing] = React.useState(false);
  
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useUserByIdQuery(id);
  
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    error: postsError,
  } = useUserPostsQuery(id);
  
  const { data: friendsData } = useFriendsQuery(currentUser?._id);
  const sendFriendRequest = useSendFriendRequest();
  
  // Check if this user is already a friend of the current user
  const isFriend = React.useMemo(() => {
    if (!friendsData?.friends || !id) return false;
    return friendsData.friends.some(friend => friend._id === id);
  }, [friendsData, id]);

  const handleSendFriendRequest = () => {
    sendFriendRequest.mutate({
      requesterId: currentUser?._id,
      recipientId: id,
    });
  };

  if (isLoadingUser) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (isUserError) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded mb-4">
        <h3 className="font-bold text-lg">Error loading profile</h3>
        <p>{userError.message || "Failed to load user profile"}</p>
      </div>
    );
  }

  const user = userData;

  return (
    <div className="container max-w-4xl py-6">
      <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              {user.name.split(" ").map(part => part[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            
            <div className="mt-4 flex justify-center md:justify-start gap-2">
              {isCurrentUser ? (
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              ) : (
                !isFriend && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleSendFriendRequest}
                    disabled={sendFriendRequest.isPending}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Friend
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isEditing ? (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
          <h2 className="font-semibold text-xl mb-4">Edit Profile</h2>
          <ProfileEditForm 
            user={user} 
            onSuccess={() => setIsEditing(false)} 
          />
        </div>
      ) : (
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : isPostsError ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded">
                <p>{postsError.message || "Failed to load posts"}</p>
              </div>
            ) : (
              <PostList posts={postsData?.posts || []} />
            )}
          </TabsContent>
          
          <TabsContent value="about">
            <ProfileAbout user={user} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default ProfilePage;
```

## 5. Update the Friend Requests Page

Update the friend requests page to match the components we've created in `src/pages/FriendRequestsPage.jsx`:

```jsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import FriendRequests from "@/features/friend/FriendRequests";

/**
 * Page for displaying friend requests
 */
function FriendRequestsPage() {
  const { user } = useAuth();

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">Friend Requests</h1>
      <FriendRequests userId={user?._id} />
    </div>
  );
}

export default FriendRequestsPage;
```

## 6. Update the Sidebar to Show the Friend Request Count

Let's update the sidebar to show the number of incoming friend requests. Modify `src/layouts/Sidebar.jsx`:

```jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Bell, Image, UserRound, SunMoon } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useIncomingFriendRequestsQuery } from "@/hooks/useFriendQuery";

/**
 * Sidebar navigation component
 * @param {Object} props - Component props
 * @param {boolean} props.isSidebarOpen - Whether the sidebar is open
 * @param {function} props.onCloseSidebar - Function to close the sidebar (mobile only)
 */
function Sidebar({ isSidebarOpen, onCloseSidebar }) {
  const location = useLocation();
  const { user } = useAuth();
  const { data: friendRequests } = useIncomingFriendRequestsQuery(user?._id);
  
  const requestCount = friendRequests?.count || 0;

  // Main navigation items
  const mainNavItems = [
    {
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      href: "/",
    },
    {
      label: "Friends",
      icon: <Users className="h-5 w-5" />,
      href: "/friends",
    },
    {
      label: "Friend Requests",
      icon: <Users className="h-5 w-5" />,
      href: "/friend-requests",
      badge: requestCount > 0 ? requestCount : null,
    },
    {
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/notifications",
    },
    {
      label: "Photos",
      icon: <Image className="h-5 w-5" />,
      href: "/photos",
    },
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    {
      label: "Account Settings",
      icon: <UserRound className="h-5 w-5" />,
      href: "/account",
    },
  ];

  // Navigation item component
  const NavItem = ({ item, closeSidebar }) => (
    <Link
      to={item.href}
      onClick={closeSidebar}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
        location.pathname === item.href
          ? "bg-primary text-primary-foreground"
          : "hover:bg-secondary"
      )}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.badge && (
        <Badge className="ml-auto" variant="destructive">
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  return (
    <div
      className={cn(
        "h-full border-r flex flex-col bg-background transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
      )}
    >
      <div className="p-3">
        <div
          className={cn(
            "flex items-center h-10",
            !isSidebarOpen && "md:justify-center"
          )}
        >
          <Link to="/" className="font-bold text-xl leading-none">
            {isSidebarOpen ? (
              "CoderComm"
            ) : (
              <span className="hidden md:inline">CC</span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              closeSidebar={onCloseSidebar}
            />
          ))}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              closeSidebar={onCloseSidebar}
            />
          ))}
        </nav>
      </div>

      <div className="p-3 border-t flex justify-between items-center">
        <Link
          to={`/user/${user?._id}`}
          onClick={onCloseSidebar}
          className={cn(
            "flex items-center gap-3 p-2 rounded-md hover:bg-secondary",
            !isSidebarOpen && "md:justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{user?.name}</div>
            </div>
          )}
        </Link>

        {isSidebarOpen && (
          <Button variant="ghost" size="icon" title="Theme">
            <SunMoon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
```

## 7. Running the Application

With the friend system implemented, start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`, log in, and try these features:

1. View your friends list on the Friends page
2. Send friend requests by visiting other user profiles
3. View and manage incoming friend requests
4. Accept or decline friend requests
5. Remove friends from your friends list

## 8. What You've Built

Congratulations! You've now completed the core features of the CoderComm social media application:

1. User authentication and authorization
2. User profiles with editing capabilities
3. Post creation and feed display
4. Comments on posts
5. Friend system with requests and management

These features form the foundation of a complete social networking application. You've learned how to structure a React application, manage state with Zustand, fetch data with React Query, and create a responsive UI with ShadCN UI and Tailwind CSS.

## 9. Next Steps and Enhancements

Here are some ideas for enhancing your CoderComm application:

1. **Notifications System**:
   - Create real-time notifications for friend requests, likes, and comments
   - Add a notification bell with a dropdown menu

2. **User Search**:
   - Implement a search feature to find users
   - Add filters and sorting options

3. **Messaging System**:
   - Build a private messaging feature between friends
   - Add read receipts and online status indicators

4. **Media Sharing**:
   - Allow users to upload and share images and videos
   - Create a gallery view for media

5. **Real-time Updates**:
   - Implement WebSockets for live updates
   - Add typing indicators for comments

6. **Advanced Authentication**:
   - Add social login options
   - Implement two-factor authentication

As you continue to develop your skills, you can return to this project and implement these additional features to create an even more robust social media application. 