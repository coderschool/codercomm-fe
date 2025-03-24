# Friends Feature

In this step, we'll build the friends feature, which will allow users to send, accept, and decline friend requests, and manage their friend connections.

## Create Friend Hooks

First, let's create hooks for managing friend interactions. Create or update `src/features/friend/friendHooks.js`:

```javascript
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
 * Get incoming friend requests
 * @param {string} filterName - Name to filter requests by
 * @param {number} page - Page number
 * @returns {Object} Query result with incoming requests and pagination
 */
export const useGetFriendRequests = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', 'requests', 'incoming', filterName, page],
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: USERS_PER_PAGE, 
        filter: filterName 
      });
      
      const response = await apiService.get('/friends/requests/incoming', { params });
      return response;
    },
  });
};

/**
 * Get outgoing friend requests
 * @param {string} filterName - Name to filter requests by
 * @param {number} page - Page number
 * @returns {Object} Query result with outgoing requests and pagination
 */
export const useGetOutgoingRequests = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', 'requests', 'outgoing', filterName, page],
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: USERS_PER_PAGE, 
        filter: filterName 
      });
      
      const response = await apiService.get('/friends/requests/outgoing', { params });
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

## Create Friend Components

Now, let's create components for managing friends.

### Create SearchInput Component

First, create a search input component in `src/components/SearchInput.jsx`:

```jsx
import React from "react";

function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          className="w-4 h-4 text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchInput;
```

### Create FriendStatus Component

Create `src/features/friend/FriendStatus.jsx`:

```jsx
import React from "react";
import { 
  useSendFriendRequest, 
  useAcceptFriendRequest, 
  useDeclineFriendRequest, 
  useCancelFriendRequest, 
  useRemoveFriend 
} from "./friendHooks";

function FriendStatus({ targetUserId, friendStatus, actionCallback }) {
  const sendFriendRequestMutation = useSendFriendRequest();
  const acceptFriendRequestMutation = useAcceptFriendRequest();
  const declineFriendRequestMutation = useDeclineFriendRequest();
  const cancelFriendRequestMutation = useCancelFriendRequest();
  const removeFriendMutation = useRemoveFriend();
  
  const handleAction = async (action) => {
    try {
      if (action === "add") {
        await sendFriendRequestMutation.mutateAsync(targetUserId);
      } else if (action === "accept") {
        await acceptFriendRequestMutation.mutateAsync(targetUserId);
      } else if (action === "decline") {
        await declineFriendRequestMutation.mutateAsync(targetUserId);
      } else if (action === "cancel") {
        await cancelFriendRequestMutation.mutateAsync(targetUserId);
      } else if (action === "remove") {
        await removeFriendMutation.mutateAsync(targetUserId);
      }
      
      if (actionCallback) actionCallback();
    } catch (error) {
      console.error("Friend action error:", error);
    }
  };
  
  const renderActionButton = () => {
    const isLoading = 
      sendFriendRequestMutation.isPending || 
      acceptFriendRequestMutation.isPending || 
      declineFriendRequestMutation.isPending || 
      cancelFriendRequestMutation.isPending || 
      removeFriendMutation.isPending;
    
    if (friendStatus === "friend") {
      return (
        <button
          onClick={() => handleAction("remove")}
          disabled={isLoading}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          {isLoading ? "Processing..." : "Unfriend"}
        </button>
      );
    }
    
    if (friendStatus === "pending_sent") {
      return (
        <button
          onClick={() => handleAction("cancel")}
          disabled={isLoading}
          className="text-orange-600 hover:text-orange-800 font-medium text-sm"
        >
          {isLoading ? "Processing..." : "Cancel Request"}
        </button>
      );
    }
    
    if (friendStatus === "pending_received") {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAction("accept")}
            disabled={isLoading}
            className="text-green-600 hover:text-green-800 font-medium text-sm"
          >
            {isLoading ? "Processing..." : "Accept"}
          </button>
          <button
            onClick={() => handleAction("decline")}
            disabled={isLoading}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            {isLoading ? "Processing..." : "Decline"}
          </button>
        </div>
      );
    }
    
    // Default: not a friend
    return (
      <button
        onClick={() => handleAction("add")}
        disabled={isLoading}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        {isLoading ? "Processing..." : "Add Friend"}
      </button>
    );
  };
  
  return (
    <div className="flex items-center justify-end">
      {renderActionButton()}
    </div>
  );
}

export default FriendStatus;
```

### Create ActionButton Component

Create `src/features/friend/ActionButton.jsx`:

```jsx
import React from "react";
import FriendStatus from "./FriendStatus";

function ActionButton({ user, actionCallback }) {
  if (!user) return null;
  
  return (
    <FriendStatus
      targetUserId={user._id}
      friendStatus={user.friendship?.status}
      actionCallback={actionCallback}
    />
  );
}

export default ActionButton;
```

### Create UserCard Component

Create `src/features/friend/UserCard.jsx`:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_AVATAR } from "@/lib/config";
import ActionButton from "./ActionButton";

function UserCard({ user, actionCallback }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center">
          <Link to={`/user/${user._id}`} className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={user.avatarUrl || DEFAULT_AVATAR}
              alt={user.name}
            />
          </Link>
          
          <div className="ml-4 flex-1 min-w-0">
            <Link 
              to={`/user/${user._id}`}
              className="text-lg font-medium text-gray-900 hover:underline truncate"
            >
              {user.name}
            </Link>
            
            {user.jobTitle && (
              <p className="text-sm text-gray-500 truncate">
                {user.jobTitle} {user.company ? `at ${user.company}` : ''}
              </p>
            )}
          </div>
          
          <div className="ml-4">
            <ActionButton user={user} actionCallback={actionCallback} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserCard;
```

### Create UserTable Component

Create `src/features/friend/UserTable.jsx`:

```jsx
import React, { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import SearchInput from "@/components/SearchInput";
import UserCard from "./UserCard";
import useAuth from "@/hooks/useAuth";

function UserTable({ 
  users, 
  totalUsers = 0, 
  totalPages = 0, 
  page = 1, 
  setPage, 
  filterName, 
  setFilterName,
  isLoading,
  error,
  emptyMessage = "No users found.",
  actionCallback
}) {
  const { user: currentUser } = useAuth();
  const [searchValue, setSearchValue] = useState(filterName || "");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setFilterName(searchValue);
  };
  
  if (isLoading) {
    return <LoadingScreen message="Loading users..." fullScreen={false} />;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md my-4">
        Error: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search by name..."
        />
      </form>
      
      {users && users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => {
            // Skip current user
            if (user._id === currentUser?.id) return null;
            
            return (
              <UserCard 
                key={user._id} 
                user={user} 
                actionCallback={actionCallback}
              />
            );
          })}
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
              <div>
                Showing {users.length} out of {totalUsers} users
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      )}
    </div>
  );
}

export default UserTable;
```

### Create AddFriend Component

Create `src/features/friend/AddFriend.jsx`:

```jsx
import React, { useState } from "react";
import { useGetUsers } from "./friendHooks";
import UserTable from "./UserTable";

function AddFriend() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useGetUsers(filterName, page);
  const { users, count: totalUsers, totalPages } = data || {};
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Friends</h2>
      
      <UserTable
        users={users}
        totalUsers={totalUsers}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        filterName={filterName}
        setFilterName={setFilterName}
        isLoading={isLoading}
        error={error}
        emptyMessage="No users found matching your search."
      />
    </div>
  );
}

export default AddFriend;
```

### Create FriendList Component

Create `src/features/friend/FriendList.jsx`:

```jsx
import React, { useState } from "react";
import { useGetFriends } from "./friendHooks";
import UserTable from "./UserTable";

function FriendList() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useGetFriends(filterName, page);
  const { users: friends, count: totalFriends, totalPages } = data || {};
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      
      <UserTable
        users={friends}
        totalUsers={totalFriends}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        filterName={filterName}
        setFilterName={setFilterName}
        isLoading={isLoading}
        error={error}
        emptyMessage="You don't have any friends yet."
      />
    </div>
  );
}

export default FriendList;
```

### Create FriendRequests Component

Create `src/features/friend/FriendRequests.jsx`:

```jsx
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import { useGetFriendRequests, useGetOutgoingRequests } from "./friendHooks";
import UserTable from "./UserTable";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function FriendRequests() {
  // Incoming requests state
  const [incomingFilterName, setIncomingFilterName] = useState("");
  const [incomingPage, setIncomingPage] = useState(1);
  
  // Outgoing requests state
  const [outgoingFilterName, setOutgoingFilterName] = useState("");
  const [outgoingPage, setOutgoingPage] = useState(1);
  
  // Fetch incoming friend requests
  const incomingQuery = useGetFriendRequests(incomingFilterName, incomingPage);
  const { 
    data: incomingData, 
    isLoading: incomingLoading, 
    error: incomingError 
  } = incomingQuery;
  
  // Fetch outgoing friend requests
  const outgoingQuery = useGetOutgoingRequests(outgoingFilterName, outgoingPage);
  const { 
    data: outgoingData, 
    isLoading: outgoingLoading, 
    error: outgoingError 
  } = outgoingQuery;
  
  // Extract data
  const incomingRequests = incomingData?.users || [];
  const outgoingRequests = outgoingData?.users || [];
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      
      <Tab.Group>
        <Tab.List className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'focus:outline-none',
                selected
                  ? 'bg-white shadow'
                  : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            Incoming ({incomingData?.count || 0})
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'focus:outline-none',
                selected
                  ? 'bg-white shadow'
                  : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            Outgoing ({outgoingData?.count || 0})
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <UserTable
              users={incomingRequests}
              totalUsers={incomingData?.count}
              totalPages={incomingData?.totalPages}
              page={incomingPage}
              setPage={setIncomingPage}
              filterName={incomingFilterName}
              setFilterName={setIncomingFilterName}
              isLoading={incomingLoading}
              error={incomingError}
              emptyMessage="No incoming friend requests."
              actionCallback={() => incomingQuery.refetch()}
            />
          </Tab.Panel>
          <Tab.Panel>
            <UserTable
              users={outgoingRequests}
              totalUsers={outgoingData?.count}
              totalPages={outgoingData?.totalPages}
              page={outgoingPage}
              setPage={setOutgoingPage}
              filterName={outgoingFilterName}
              setFilterName={setOutgoingFilterName}
              isLoading={outgoingLoading}
              error={outgoingError}
              emptyMessage="No outgoing friend requests."
              actionCallback={() => outgoingQuery.refetch()}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default FriendRequests;
```

## Create Friends Pages

Now, let's create pages to display and manage friends.

### Create FriendsPage

Create `src/pages/FriendsPage.jsx`:

```jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Tab } from "@headlessui/react";
import AddFriend from "../features/friend/AddFriend";
import FriendList from "../features/friend/FriendList";
import FriendRequests from "../features/friend/FriendRequests";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function FriendsPage() {
  return (
    <>
      <Helmet>
        <title>Friends | CoderComm</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Friends</h1>
        
        <Tab.Group>
          <Tab.List className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              Friends
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              Requests
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              Find Friends
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <FriendList />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <FriendRequests />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <AddFriend />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}

export default FriendsPage;
```

## Update User Profile Page with Friend Status

Let's update the User Profile page to include friend status:

```jsx
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Profile from "../features/user/Profile";
import PostList from "../features/post/PostList";
import FriendStatus from "../features/friend/FriendStatus";
import { useGetUserProfile } from "../features/user/userHooks";
import LoadingScreen from "../components/LoadingScreen";
import useAuth from "../hooks/useAuth";

function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading, refetch } = useGetUserProfile(userId);
  
  const isCurrentUser = currentUser && userId === currentUser.id;
  
  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }
  
  return (
    <>
      <Helmet>
        <title>{user?.name || "User"} | CoderComm</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          
          {!isCurrentUser && user && (
            <FriendStatus
              targetUserId={userId}
              friendStatus={user.friendship?.status}
              actionCallback={refetch}
            />
          )}
        </div>
        
        <Profile />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          <PostList userId={userId} />
        </div>
      </div>
    </>
  );
}

export default UserProfilePage;
```

## Update MainHeader to Include Friends Link

Update `src/layouts/MainHeader.jsx` to include a link to the friends page:

```jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import useAuth from "../hooks/useAuth";

function MainHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
            
            <nav className="ml-6 space-x-4">
              <Link to="/" className="text-gray-700 hover:text-primary">
                Home
              </Link>
              <Link to="/friends" className="text-gray-700 hover:text-primary">
                Friends
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="flex items-center">
                <Link
                  to="/account"
                  className="mr-4 text-gray-700 hover:text-primary"
                >
                  Account
                </Link>
                <Link
                  to={`/user/${user.id}`}
                  className="flex items-center mr-4 hover:text-primary"
                >
                  <img
                    className="h-8 w-8 rounded-full mr-2"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
```

## Update Routes

Update `src/routes/index.jsx` to include the friends page:

```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UserProfilePage from "../pages/UserProfilePage";
import AccountPage from "../pages/AccountPage";
import FriendsPage from "../pages/FriendsPage";
import NotFoundPage from "../pages/NotFoundPage";

function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRequire>
            <MainLayout />
          </AuthRequire>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="user/:userId" element={<UserProfilePage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="friends" element={<FriendsPage />} />
      </Route>

      <Route element={<BlankLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default Router;
```

## Test the Friends Feature

Run your application and test the friends features:

```bash
npm run dev
```

You should be able to:
- View and search for users on the "Find Friends" page
- Send friend requests
- View incoming and outgoing friend requests
- Accept or decline friend requests
- View your friends list
- Unfriend users
- See friend status on user profiles

With this, we have completed all the main features of our CoderComm application. In the next step, we'll make some final optimizations and prepare for deployment.