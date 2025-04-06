# Step 7: Friend System

In this step, we'll implement the friend system, allowing users to view their friends list, manage friend requests, and find new users to connect with. We will create dedicated pages for these features and link them from the sidebar.

## 1. Understanding the Mock API Endpoints for Friends

Review the mock API endpoints we'll use:

*   `GET /api/friends`: Get the current user's accepted friends list (paginated).
*   `GET /api/users`: Get a list of all users (paginated, used for searching/finding friends).
*   `GET /api/friends/requests/incoming`: Get pending friend requests received by the current user.
*   `GET /api/friends/requests/outgoing`: Get pending friend requests sent by the current user.
*   `POST /api/friends/requests`: Send a friend request (body: `{ to: targetUserId }`).
*   `PUT /api/friends/requests/:requesterId?action=accept|decline`: Accept or decline an *incoming* request.
*   `DELETE /api/friends/requests/:recipientId`: Cancel an *outgoing* friend request sent by the current user.
*   `DELETE /api/friends/:friendId`: Remove an existing friendship (unfriend).

## 2. Create Friend Hooks with React Query

We need several hooks to manage friend data and actions. We'll place these in a new dedicated hook file.

Create `src/hooks/useFriendQuery.js`:

```jsx
// src/hooks/useFriendQuery.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery // Using infinite query for user search
} from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '@/lib/apiService'; // Use absolute path
import { getPaginationParams } from '@/lib/utils'; // Use absolute path

const USERS_PER_PAGE = 9; // Define items per page for pagination

// --- Queries --- 

/**
 * Fetches the current user's accepted friends list (paginated).
 */
export const useGetFriends = (filterName = '', page = 1) => {
  return useQuery({
    queryKey: ['friends', filterName, page], // Cache key includes filter and page
    queryFn: async () => {
      const params = getPaginationParams({ 
        page, 
        limit: USERS_PER_PAGE, 
        filter: filterName,
        filterKey: 'name' // Ensure filter key matches API expectation
      });
      console.log("Fetching friends with params:", params);
      const response = await apiService.get('/friends', { params });
      // API returns { users: [], count: X, totalPages: Y }
      return response.data; 
    },
    keepPreviousData: true, // Keep previous data visible while fetching next page
  });
};

/**
 * Fetches incoming friend requests for the current user.
 */
export const useGetIncomingFriendRequests = () => {
  return useQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => {
      console.log("Fetching incoming friend requests...");
      const response = await apiService.get('/friends/requests/incoming');
      // API returns { requests: [], count: X, totalPages: Y } 
      // containing friendship object with embedded requester info
      return response.data;
    },
  });
};

/**
 * Fetches outgoing friend requests sent by the current user.
 */
export const useGetOutgoingFriendRequests = () => {
  return useQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => {
      console.log("Fetching outgoing friend requests...");
      const response = await apiService.get('/friends/requests/outgoing');
      // API returns { requests: [], count: X, totalPages: Y } 
      // containing friendship object with embedded recipient info
      return response.data;
    },
  });
};

/**
 * Fetches users for discovery/searching (infinite scroll).
 */
export const useSearchUsers = (filterName = '') => {
  return useInfiniteQuery({
    queryKey: ['users', 'search', filterName], // Key includes search term
    queryFn: async ({ pageParam = 1 }) => {
      const params = getPaginationParams({ 
          page: pageParam, 
          limit: USERS_PER_PAGE, 
          filter: filterName, 
          filterKey: 'name' 
      });
      console.log(`Searching users: name='${filterName}', page=${pageParam}`);
      const response = await apiService.get('/users', { params });
      // API returns { users: [], count: X, totalPages: Y }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!filterName, // Only run query if there is a search term
  });
};

// --- Mutations --- 

/**
 * Mutation hook to send a friend request.
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId) => {
      console.log(`Sending friend request to: ${targetUserId}`);
      const response = await apiService.post('/friends/requests', { to: targetUserId });
      return response.data; // API likely returns { success: true, ... }
    },
    onSuccess: (data, targetUserId) => {
      toast.success('Friend request sent');
      // Invalidate queries that display user lists or request status
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] }); // Refetch user search results
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });
      // Could potentially update specific user cache entry if needed
      // queryClient.invalidateQueries({ queryKey: ['users', targetUserId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });
};

/**
 * Mutation hook to accept an incoming friend request.
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID here is the ID of the person *who sent* the request
    mutationFn: async (requesterId) => {
      console.log(`Accepting friend request from: ${requesterId}`);
      // Mock API expects action in query param
      const response = await apiService.put(`/friends/requests/${requesterId}?action=accept`);
      return response.data; // API likely returns updated friendship
    },
    onSuccess: (data, requesterId) => {
      toast.success('Friend request accepted');
      // Invalidate requests list, friends list, and potentially user search
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      // Could update specific user caches if needed
      // queryClient.invalidateQueries({ queryKey: ['users', requesterId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });
};

/**
 * Mutation hook to decline an incoming friend request.
 */
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID is the requester's ID
    mutationFn: async (requesterId) => {
      console.log(`Declining friend request from: ${requesterId}`);
      // Mock API expects action in query param
      const response = await apiService.put(`/friends/requests/${requesterId}?action=decline`);
      return response.data; // API likely returns { success: true, ... }
    },
    onSuccess: (data, requesterId) => {
      toast.info('Friend request declined'); // Use info or success
      // Only need to invalidate incoming requests list
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
      // Maybe user search if status was shown there
      // queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to decline friend request');
    },
  });
};

/**
 * Mutation hook to cancel an outgoing friend request.
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID is the recipient's ID
    mutationFn: async (recipientId) => {
      console.log(`Cancelling friend request to: ${recipientId}`);
      await apiService.delete(`/friends/requests/${recipientId}`);
      // No response body expected on 204
      return recipientId; 
    },
    onSuccess: (recipientId) => {
      toast.info('Friend request cancelled');
      // Invalidate outgoing requests and user search
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      // queryClient.invalidateQueries({ queryKey: ['users', recipientId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel friend request');
    },
  });
};

/**
 * Mutation hook to remove a friend (unfriend).
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Target user ID is the friend's ID
    mutationFn: async (friendId) => {
      console.log(`Removing friend: ${friendId}`);
      await apiService.delete(`/friends/${friendId}`);
      // No response body expected on 204
      return friendId;
    },
    onSuccess: (friendId) => {
      toast.info('Friend removed');
      // Invalidate friends list and potentially user search/profile
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
      // queryClient.invalidateQueries({ queryKey: ['users', friendId] });
      // Also invalidate incoming/outgoing requests in case something weird happened
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove friend');
    },
  });
};
```

**Explanation:**

*   **Queries**: Hooks (`useGetFriends`, `useGetIncomingFriendRequests`, `useGetOutgoingFriendRequests`, `useSearchUsers`) are created using `useQuery` or `useInfiniteQuery` to fetch the necessary data lists. They use appropriate query keys for caching.
*   **Mutations**: Hooks (`useSendFriendRequest`, `useAcceptFriendRequest`, etc.) are created using `useMutation` for each friend-related action (send, accept, decline, cancel, remove).
*   **API Alignment**: Mutation functions now correctly call the mock API endpoints (e.g., using query params for accept/decline).
*   **Invalidation**: `onSuccess` callbacks use `queryClient.invalidateQueries` to refetch relevant data lists after an action is performed, ensuring the UI stays up-to-date.

## 3. Create Reusable User Card and Action Button Components

We need components to display user information consistently and handle the various friend action buttons.

Create `src/features/friend/UserCard.jsx`:

```jsx
// src/features/friend/UserCard.jsx
import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Components & Hooks
import useAuth from "@/hooks/useAuth";
import ActionButton from "./ActionButton"; // We'll create this next
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Clock } from "lucide-react";

// Utilities
import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

/**
 * Displays a user's information in a card format, 
 * including name, avatar, and an appropriate action button.
 */
function UserCard({ profile, friendshipContext = 'search' }) {
  const { user: currentUser } = useAuth();
  if (!currentUser) return null; // Don't render if current user isn't loaded

  const { 
      _id: targetUserId, 
      name,
      avatarUrl,
      email, // Included for display, consider privacy
      friendship // This comes from the API response (e.g., in /users search)
  } = profile;

  // Don't show card for the current user in search/lists
  if (currentUser._id === targetUserId && friendshipContext !== 'request') return null; 

  // Determine the context for the action button based on friendship status
  let actionContext = friendshipContext;
  if (friendship) {
      if (friendship.status === 'pending' && friendship.to === currentUser._id) {
          actionContext = 'incoming_request';
      } else if (friendship.status === 'pending' && friendship.from === currentUser._id) {
          actionContext = 'outgoing_request';
      } else if (friendship.status === 'accepted') {
          actionContext = 'friend';
      }
      // Add declined/blocked later if needed
  }

  return (
    <Card className={cn("p-3", 
        // Add subtle indicator for pending requests (optional)
        actionContext === 'incoming_request' && "border-primary/50",
        actionContext === 'outgoing_request' && "border-dashed"
    )}>
      <div className="flex items-center justify-between gap-2">
        {/* Left side: Avatar and Info */}
        <div className="flex items-center gap-2 overflow-hidden">
          <Link to={`/user/${targetUserId}`} className="flex-shrink-0">
            <Avatar className="w-10 h-10 border">
              <AvatarImage src={avatarUrl || ''} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/user/${targetUserId}`}
              className="font-semibold text-sm hover:underline block truncate"
              title={name} // Show full name on hover
            >
              {name}
            </Link>
            {/* Optionally show email or other info */}
            {/* <p className="text-xs text-muted-foreground truncate" title={email}>{email}</p> */} 
          </div>
        </div>
        
        {/* Right side: Action Button */}
        <div className="flex-shrink-0">
          <ActionButton
            targetUserId={targetUserId}
            context={actionContext} // Pass the determined context
          />
        </div>
      </div>
      
      {/* Optional: Timestamp for pending requests */}
      {/* Display based on original friendship object, not derived context */} 
      {friendship && friendship.status === "pending" && friendship.createdAt && (
        <div className="ml-12 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Request {friendship.from === currentUser._id ? "sent" : "received"} {formatDistanceToNow(new Date(friendship.createdAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </Card>
  );
}

UserCard.propTypes = {
  profile: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
      email: PropTypes.string,
      friendship: PropTypes.object, // Friendship object might be present
      createdAt: PropTypes.string, // For pending request display
  }).isRequired,
  // Context helps ActionButton decide what to render if friendship status isn't on profile
  friendshipContext: PropTypes.oneOf(['search', 'friend_list', 'request']).isRequired,
};

export default UserCard;
```

Create `src/features/friend/ActionButton.jsx`:

```jsx
// src/features/friend/ActionButton.jsx
import React from "react";
import PropTypes from 'prop-types';
import {
  useSendFriendRequest, 
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend
} from "@/hooks/useFriendQuery"; // Import hooks
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus, UserCheck, UserX, XCircle } from "lucide-react";

/**
 * Renders the appropriate friend action button based on the relationship context.
 * @param {object} props
 * @param {string} props.targetUserId - The ID of the user the action applies to.
 * @param {string} props.context - The relationship context ('search', 'friend', 'incoming_request', 'outgoing_request').
 */
function ActionButton({ targetUserId, context }) {
  // Get mutation hooks
  const { mutate: sendRequestMutate, isPending: isSending } = useSendFriendRequest();
  const { mutate: acceptRequestMutate, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: declineRequestMutate, isPending: isDeclining } = useDeclineFriendRequest();
  const { mutate: cancelRequestMutate, isPending: isCancelling } = useCancelFriendRequest();
  const { mutate: removeFriendMutate, isPending: isRemoving } = useRemoveFriend();

  const isLoading = isSending || isAccepting || isDeclining || isCancelling || isRemoving;

  // --- Render logic based on context ---

  // Context: Search results or profile where no existing relationship/request exists
  if (context === 'search') {
    return (
      <Button size="sm" onClick={() => sendRequestMutate(targetUserId)} disabled={isLoading}>
        {isSending ? 
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <UserPlus className="mr-2 h-4 w-4" />}
        Add Friend
      </Button>
    );
  }

  // Context: Displaying a confirmed friend
  if (context === 'friend') {
    return (
      <Button size="sm" variant="outline" onClick={() => removeFriendMutate(targetUserId)} disabled={isLoading}>
         {isRemoving ? 
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <UserMinus className="mr-2 h-4 w-4" />}
        Unfriend
      </Button>
    );
  }

  // Context: Displaying an incoming friend request
  if (context === 'incoming_request') {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button size="sm" onClick={() => acceptRequestMutate(targetUserId)} disabled={isLoading}>
          {isAccepting ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <UserCheck className="mr-2 h-4 w-4" />}
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => declineRequestMutate(targetUserId)} disabled={isLoading}>
          {isDeclining ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <UserX className="mr-2 h-4 w-4" />}
          Decline
        </Button>
      </div>
    );
  }

  // Context: Displaying an outgoing friend request
  if (context === 'outgoing_request') {
    return (
      <Button size="sm" variant="outline" onClick={() => cancelRequestMutate(targetUserId)} disabled={isLoading}>
         {isCancelling ? 
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <XCircle className="mr-2 h-4 w-4" />}
        Cancel Request
      </Button>
    );
  }

  // Fallback or other contexts (e.g., 'declined', 'blocked' - not implemented fully here)
  // You might return null or a different button (e.g., "Request Sent")
  return null; 
}

ActionButton.propTypes = {
  targetUserId: PropTypes.string.isRequired,
  context: PropTypes.oneOf(['search', 'friend', 'incoming_request', 'outgoing_request']).isRequired,
};

export default ActionButton;
```

**Explanation:**

*   **`UserCard`**: Displays avatar, name, and calls `ActionButton` to render the correct button(s).
*   **`ActionButton`**: This is the core logic component.
    *   It imports all necessary mutation hooks from `useFriendQuery`.
    *   It receives the `targetUserId` and a `context` prop (`'search'`, `'friend'`, `'incoming_request'`, `'outgoing_request'`).
    *   Based on the `context`, it renders the appropriate button or set of buttons (e.g., Accept/Decline for incoming requests).
    *   Each button's `onClick` calls the corresponding mutation function with the `targetUserId`.
    *   Buttons are disabled based on the `isPending` state of the relevant mutation to prevent double-clicks.

## 4. Create Dedicated Pages for Friend Management

Instead of tabs on the HomePage, we'll create separate pages accessible from the sidebar.

Create `src/pages/FriendsPage.jsx`:

```jsx
// src/pages/FriendsPage.jsx
import React, { useState } from "react";
import { useGetFriends } from "@/hooks/useFriendQuery";
import UserCard from "@/features/friend/UserCard";
import SearchInput from "@/components/SearchInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PaginationControls from "@/components/PaginationControls"; // Assuming you have this

function FriendsPage() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);

  // Fetch friends data using the hook
  const { data, isLoading, isError, error } = useGetFriends(filterName, page);
  
  // Safely extract data
  const friends = data?.users || [];
  const totalFriends = data?.count || 0;
  const totalPages = data?.totalPages || 1;

  // Handler for search submission
  const handleSearch = (query) => {
    setFilterName(query);
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Friends</h1>

      <Card>
        <CardHeader>
          <SearchInput 
            placeholder="Search friends..." 
            handleSubmit={handleSearch} 
            initialValue={filterName}
          />
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isError && (
            <p className="text-destructive text-center py-10">
              Error loading friends: {error.message}
            </p>
          )}
          {!isLoading && !isError && (
            <>
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  You haven't added any friends yet, or no friends match your search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <UserCard 
                      key={friend._id} 
                      profile={friend} 
                      friendshipContext="friend_list" // Pass context
                    />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                 <PaginationControls 
                   currentPage={page} 
                   totalPages={totalPages} 
                   onPageChange={setPage} 
                 />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Ensure SearchInput and PaginationControls exist or create basic placeholders
// Placeholder SearchInput:
// const SearchInput = ({ handleSubmit, placeholder, initialValue }) => <input placeholder={placeholder} onChange={e => handleSubmit(e.target.value)} defaultValue={initialValue} className="border p-2" />;
// Placeholder PaginationControls:
// const PaginationControls = ({ currentPage, totalPages, onPageChange }) => <div>Pagination: Page {currentPage} of {totalPages} {/* Add buttons here */}</div>;

export default FriendsPage;
```

Create `src/pages/FriendRequestsPage.jsx`:

```jsx
// src/pages/FriendRequestsPage.jsx
import React from "react";
import { useGetIncomingFriendRequests, useGetOutgoingFriendRequests } from "@/hooks/useFriendQuery";
import UserCard from "@/features/friend/UserCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function FriendRequestsPage() {
  // Fetch both incoming and outgoing requests
  const { data: incomingData, isLoading: isLoadingIncoming } = useGetIncomingFriendRequests();
  const { data: outgoingData, isLoading: isLoadingOutgoing } = useGetOutgoingFriendRequests();

  const incomingRequests = incomingData?.requests || [];
  const outgoingRequests = outgoingData?.requests || [];

  const isLoading = isLoadingIncoming || isLoadingOutgoing;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Friend Requests</h1>

      {/* Incoming Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Requests ({incomingRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
          {!isLoading && incomingRequests.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No incoming friend requests.</p>
          )}
          {!isLoading && incomingRequests.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomingRequests.map((request) => (
                // Pass the requester's profile and indicate context
                <UserCard 
                  key={request._id} 
                  profile={request.requester} 
                  friendshipContext="request" // Pass request context
                  // Pass the full friendship object for ActionButton if needed, 
                  // although context might be enough for the simplified mock
                  // friendshipObj={request} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outgoing Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Requests ({outgoingRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
           {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
           {!isLoading && outgoingRequests.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No outgoing friend requests.</p>
          )}
          {!isLoading && outgoingRequests.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {outgoingRequests.map((request) => (
                // Pass the recipient's profile and indicate context
                <UserCard 
                  key={request._id} 
                  profile={request.recipient} 
                  friendshipContext="request"
                  // friendshipObj={request}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FriendRequestsPage;
```

Create `src/pages/UserSearchPage.jsx`:

```jsx
// src/pages/UserSearchPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchUsers } from "@/hooks/useFriendQuery";
import UserCard from "@/features/friend/UserCard";
import SearchInput from "@/components/SearchInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

function UserSearchPage() {
  const [filterName, setFilterName] = useState("");
  
  // Use infinite query for searching users
  const { 
      data,
      fetchNextPage,
      hasNextPage,
      isLoading,
      isFetchingNextPage,
      isError,
      error 
  } = useSearchUsers(filterName);

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
      if (inView && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
      }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (query) => {
    // Resetting pagination is handled by React Query when queryKey changes
    setFilterName(query);
  };

  // Flatten pages for display
  const users = data?.pages.flatMap(page => page.users) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find Users</h1>

      <Card>
        <CardHeader>
           <SearchInput 
            placeholder="Search for users by name..." 
            handleSubmit={handleSearch} 
            initialValue={filterName}
            // Add a debounce here in a real app if needed
          />
        </CardHeader>
        <CardContent>
          {/* Initial Loading or No Search Term */} 
          {isLoading && !isFetchingNextPage && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!filterName && !isLoading && (
              <p className="text-muted-foreground text-center py-10">
                  Enter a name to search for users.
                </p>
          )}
          
          {/* Error State */}
          {isError && filterName && (
            <p className="text-destructive text-center py-10">
              Error searching users: {error.message}
            </p>
          )}

          {/* Results Area */} 
          {filterName && !isLoading && !isError && (
            <>
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  No users found matching "{filterName}".
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <UserCard 
                      key={user._id} 
                      profile={user} 
                      friendshipContext="search" // Pass context
                    />
                  ))}
                </div>
              )}
              
              {/* Load More Trigger/Indicator */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center pt-6">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Scroll down to load more</span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserSearchPage;
```

**Note:** These pages assume you have or will create basic `SearchInput` and `PaginationControls` components. If not, use standard HTML inputs/buttons or install simple component libraries.

## 5. Update Routes

Add routes for the new friend system pages in `src/routes/index.jsx`:

```jsx
// src/routes/index.jsx
// ... other imports ...
const FriendsPage = React.lazy(() => import("../pages/FriendsPage"));
const FriendRequestsPage = React.lazy(() => import("../pages/FriendRequestsPage"));
const UserSearchPage = React.lazy(() => import("../pages/UserSearchPage")); 

function Router() {
  return (
    <React.Suspense fallback={<LoadingScreen message="Loading page..." />}>
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={<AuthRequire><MainLayout /></AuthRequire>}
        >
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="user/:userId" element={<ProfilePage />} /> 
          {/* Add Friend System Routes */}
          <Route path="friends" element={<FriendsPage />} />
          <Route path="requests" element={<FriendRequestsPage />} />
          <Route path="find-users" element={<UserSearchPage />} /> 
        </Route>

        {/* Guest Routes */}
        {/* ... rest of the routes ... */}
      </Routes>
    </React.Suspense>
  );
}

export default Router;
```

## 6. Update Sidebar Navigation

Modify `src/layouts/Sidebar.jsx` to enable the previously disabled friend links and add a link to find users.

```jsx
// src/layouts/Sidebar.jsx
// ... other imports ...
import { Search } from "lucide-react"; // Import Search icon

// --- Navigation Items Configuration ---
const mainNavItems = [
  { label: "Home", icon: Home, href: "/" },
  // Update Friends link
  { label: "Friends", icon: Users, href: "/friends", disabled: false, badge: 0 }, 
  // Update Friend Requests link
  { label: "Friend Requests", icon: UserPlus, href: "/requests", disabled: false, badge: 2 }, // Keep badge example
  // Add Find Users link
  { label: "Find Users", icon: Search, href: "/find-users", disabled: false }, 
];

const secondaryNavItems = [
  { label: "Settings", icon: Settings, href: "/account" },
];

// ... rest of Sidebar component (NavItem and Sidebar logic remain the same) ...
```

## 7. Testing the Friend System

Run the application (`npm run dev`) and test the new friend system features:

1.  Use the sidebar to navigate to "Friends", "Friend Requests", and "Find Users".
2.  On the "Find Users" page, search for users (e.g., "Tran", "Le").
3.  Send friend requests to users found.
4.  Check the "Friend Requests" page:
    *   Verify you see incoming requests (if `user4` or `user5` sent one to `user1` in the mock data).
    *   Verify you see the outgoing request you just sent in the "Sent Requests" section.
    *   Accept or Decline an incoming request.
    *   Cancel an outgoing request.
5.  Check the "Friends" page - accepted friends (`user2`, `user3` initially) should appear.
6.  Try unfriending someone from the "Friends" page.
7.  Verify the UI updates correctly after each action (due to query invalidation).

## 8. Frequently Asked Questions (FAQ)

*   **Q: Why separate pages instead of tabs on HomePage?**
    *   A: Using separate pages aligns better with the sidebar navigation introduced earlier. It also decouples features, making the codebase easier to manage and scale. `HomePage` can remain focused on the core feed.
*   **Q: Why invalidate queries instead of updating the cache manually after friend actions?**
    *   A: Friend actions often affect multiple lists (friends, incoming requests, outgoing requests, user search results). Manually updating all these caches correctly is complex. Invalidating the relevant query keys (`queryClient.invalidateQueries`) is a simpler and more reliable way to ensure the UI reflects the latest state by triggering refetches.
*   **Q: How does the `ActionButton` know which button to show?**
    *   A: It receives a `context` prop (`'search'`, `'friend'`, `'incoming_request'`, `'outgoing_request'`) from the parent component (`UserCard`). Based on this context, it renders the correct button or set of buttons (e.g., Accept/Decline for incoming requests).
*   **Q: Why use `keepPreviousData: true` in `useGetFriends`?**
    *   A: When paginating or filtering the friends list, this option keeps the previously fetched data visible while the new data is loading in the background. This prevents the list from disappearing entirely during the refetch, providing a smoother user experience.

## What's Next?

We have now implemented a functional friend system!

In the final step, **Step 8: Summary and Next Steps**, we will:

1.  Briefly review the key concepts covered.
2.  Summarize the application structure.
3.  Provide suggestions for further improvements and features. 
The system will handle all these actions smoothly with appropriate feedback via toast messages. 