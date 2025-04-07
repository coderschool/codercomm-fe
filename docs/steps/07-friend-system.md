# Step 7: Friend System (Tab Integration)

In this step, we'll implement the friend system, allowing users to view their friends list and find/manage other users (sending requests, accepting/declining, etc.) directly within tabs on the `HomePage`. This involves:

1.  **Updating Friend Hooks:** Ensuring React Query hooks correctly fetch friend data and handle actions.
2.  **Building Friend Components:** Creating components (`FriendList`, `FindFriends`) to display relevant information and actions within the tabs.
3.  **Integrating into HomePage:** Placing these components into the `HomePage` tab structure.

## 1. Understanding the Mock API Endpoints for Friends

Review the mock API endpoints we'll use:

*   `GET /api/friends`: Get the current user's accepted friends list.
*   `GET /api/users`: Get a list of all users (used for finding friends).
*   `GET /api/friends/requests/incoming`: Get pending friend requests received by the current user.
*   `GET /api/friends/requests/outgoing`: Get pending friend requests sent by the current user.
*   `POST /api/friends/requests`: Send a friend request (body: `{ to: targetUserId }`).
*   `PUT /api/friends/requests/:requesterId?action=accept|decline`: Accept or decline an *incoming* request.
*   `DELETE /api/friends/requests/:recipientId`: Cancel an *outgoing* friend request sent by the current user.
*   `DELETE /api/friends/:friendId`: Remove an existing friendship (unfriend).

## 2. Update Friend Hooks with React Query

Ensure the necessary hooks are present and updated in `src/hooks/useFriendQuery.js`. We need hooks to fetch friends, requests, all users, and handle mutation actions.

```jsx
// src/hooks/useFriendQuery.js
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '@/lib/apiService';
import useAuth from './useAuth'; 

// --- Queries --- 

// Fetches the current user's accepted friends list.
export const useGetFriends = (filterName = '') => { 
  const { isAuthenticated, isInitialized } = useAuth();
  return useQuery({
    queryKey: ['friends', filterName],
    queryFn: async () => { /* ... */ },
    enabled: isInitialized && isAuthenticated,
  });
};

// Fetches incoming friend requests for the current user.
export const useGetIncomingFriendRequests = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  return useQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => { /* ... */ },
    enabled: isInitialized && isAuthenticated,
  });
};

// Fetches outgoing friend requests sent by the current user.
export const useGetOutgoingFriendRequests = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  return useQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => { /* ... */ },
    enabled: isInitialized && isAuthenticated,
  });
};

/**
 * Fetches all users for discovery. 
 * Enabled only when the user is authenticated.
 */
export const useUsers = () => { // Renamed from useSearchUsers
  const { isAuthenticated, isInitialized } = useAuth();
  return useQuery({
    queryKey: ['users', 'all'], // Updated queryKey
    queryFn: async () => {
      console.log(`Fetching all users`);
      const response = await apiService.get('/users'); // No filter params
      return response.users || response.data?.users || [];
    },
    enabled: isInitialized && isAuthenticated, 
  });
};

// --- Mutations --- 

// Helper for invalidation
const invalidateFriendQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['friends'] });
  queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
  queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });
  queryClient.invalidateQueries({ queryKey: ['users', 'all'] }); // Updated invalidated key
};

// Mutation hook to send a friend request.
export const useSendFriendRequest = () => { /* ... */ };

// Mutation hook to accept an incoming friend request.
export const useAcceptFriendRequest = () => { /* ... */ };

// Mutation hook to decline an incoming friend request.
export const useDeclineFriendRequest = () => { /* ... */ };

// Mutation hook to cancel an outgoing friend request.
export const useCancelFriendRequest = () => { /* ... */ };

// Mutation hook to remove a friend (unfriend).
export const useRemoveFriend = () => { /* ... */ };
```

**Explanation:**

*   **`useUsers`:** This hook now fetches all users from the `/users` endpoint. It's enabled when the user is authenticated.
*   **`invalidateFriendQueries`:** This helper function now invalidates `['users', 'all']` instead of `['users', 'search']` to ensure the "Find Friends" list refreshes after actions.
*   Other query and mutation hooks remain similar, fetching specific lists or performing actions and invalidating relevant queries on success.

## 3. Create Reusable User Card and Action Button Components

These components display user info and handle friend actions.

Verify `src/features/friend/UserCard.jsx`:
```jsx
// src/features/friend/UserCard.jsx
import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import useAuth from "@/hooks/useAuth";
import ActionButton from "./ActionButton"; 
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Clock } from "lucide-react";
import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

function UserCard({ profile, friendshipContext, friendshipObj }) {
  const { user: currentUser } = useAuth();
  if (!currentUser) return null; 

  const { _id: targetUserId, name, avatarUrl, friendship, createdAt } = profile;

  // Use the passed friendshipObj if available (from requests pages), 
  // otherwise use the friendship status embedded in the profile (from search/friends pages)
  const relevantFriendship = profile.friendshipObj || friendship; 

  if (currentUser._id === targetUserId && friendshipContext !== 'request') return null; 

  let actionContext = friendshipContext;
  if (relevantFriendship) {
      if (relevantFriendship.status === 'pending' && relevantFriendship.to === currentUser._id) {
          actionContext = 'incoming_request';
      } else if (relevantFriendship.status === 'pending' && relevantFriendship.from === currentUser._id) {
          actionContext = 'outgoing_request';
      } else if (relevantFriendship.status === 'accepted') {
          actionContext = 'friend';
      }
  }

  return (
    <Card className={/* ... */}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link to={`/user/${targetUserId}`} className="flex-shrink-0">{/* ... Avatar ... */}</Link>
          <div className="flex-1 min-w-0">
            <Link to={`/user/${targetUserId}`} className="font-semibold text-sm hover:underline block truncate" title={name}>{name}</Link>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ActionButton 
            targetUserId={targetUserId} 
            context={actionContext}
            friendshipObj={friendshipObj}
          />
        </div>
      </div>
      {relevantFriendship && relevantFriendship.status === "pending" && (relevantFriendship.createdAt || createdAt) && (
        <div className="ml-12 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Request {relevantFriendship.from === currentUser._id ? "sent" : "received"} {formatDistanceToNow(new Date(relevantFriendship.createdAt || createdAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </Card>
  );
}
// ... PropTypes ...
export default UserCard;
```

Verify `src/features/friend/ActionButton.jsx`:
```jsx
// src/features/friend/ActionButton.jsx
import React from "react";
import PropTypes from 'prop-types';
import { /* ...mutation hooks... */ } from "@/hooks/useFriendQuery"; 
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus, UserCheck, UserX, XCircle } from "lucide-react";

function ActionButton({ targetUserId, context, friendshipObj }) {
  // ... get mutation hooks ...
  const isLoading = /* ... check isPending states ... */;

  if (context === 'search') { /* ... 'Add Friend' button (using useSendFriendRequest) ... */ }
  if (context === 'friend') { /* ... 'Unfriend' button (using useRemoveFriend) ... */ }
  if (context === 'incoming_request') { /* ... 'Accept'/'Decline' buttons (using useAcceptFriendRequest, useDeclineFriendRequest) ... */ }
  if (context === 'outgoing_request') { /* ... 'Cancel Request' button (using useCancelFriendRequest) ... */ }

  return null; 
}
// ... PropTypes ...
export default ActionButton;
```

## 4. Create Friend Tab Components

We need components for the "Friends" list and the consolidated "Find Friends" view.

Create/Verify `src/features/friend/FriendList.jsx`:
(This component remains largely the same, potentially simplifying the friendshipContext passed to UserCard if needed)
```jsx
// src/features/friend/FriendList.jsx
import React, { useState } from "react";
import { useGetFriends } from "@/hooks/useFriendQuery";
import UserCard from "./UserCard";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

function FriendList() {
  const [filterName, setFilterName] = useState("");
  const { data: friends, isLoading, isError, error } = useGetFriends(filterName); 

  return (
    <div className="space-y-4">
      {/* ... Title, Search Input ... */}
      {/* ... Loading/Error states ... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {friends?.map((friend) => (
          // Context 'friend' indicates this is from the friends list
          <UserCard key={friend._id} profile={friend} friendshipContext="friend" /> 
        ))}
      </div>
    </div>
  );
}
export default FriendList;
```

Create `src/features/friend/FindFriends.jsx`:
This component replaces the previous `AddFriend` and `FriendRequests` functionality. It fetches all users, the current user's friends, and pending requests to determine the correct context for displaying action buttons on each user card.

```jsx
// src/features/friend/FindFriends.jsx
import React from "react";
import {
  useUsers,
  useGetFriends,
  useGetIncomingFriendRequests,
  useGetOutgoingFriendRequests,
} from "@/hooks/useFriendQuery.js";
import useAuth from "@/hooks/useAuth"; 
import UserCard from "./UserCard";
import { Card, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function FindFriends() {
  const { user: currentUser } = useAuth(); 
  const { data: allUsersData, isLoading: isLoadingUsers } = useUsers();
  const { data: friendsData, isLoading: isLoadingFriends } = useGetFriends();
  const { data: incomingReqData, isLoading: isLoadingIncoming } = useGetIncomingFriendRequests();
  const { data: outgoingReqData, isLoading: isLoadingOutgoing } = useGetOutgoingFriendRequests();

  const isLoading = isLoadingUsers || isLoadingFriends || isLoadingIncoming || isLoadingOutgoing;
  // Simplified error handling for example
  const isError = /* ... check individual error states ... */ ; 
  const error = /* ... get relevant error message ... */ ;

  // Memoize lists for efficiency
  const allUsers = React.useMemo(() => allUsersData || [], [allUsersData]);
  const friends = React.useMemo(() => friendsData || [], [friendsData]);
  const incomingRequests = React.useMemo(() => incomingReqData || [], [incomingReqData]);
  const outgoingRequests = React.useMemo(() => outgoingReqData || [], [outgoingReqData]);

  // Function to determine context for ActionButton
  const getFriendshipDetails = (targetUser) => {
    if (!currentUser || targetUser._id === currentUser._id) return { context: null }; 

    const isFriend = friends.some(f => f._id === targetUser._id);
    if (isFriend) return { context: "friend", friendshipObj: targetUser };

    const incoming = incomingRequests.find(req => req.requester?._id === targetUser._id);
    if (incoming) return { context: "incoming_request", friendshipObj: incoming };

    const outgoing = outgoingRequests.find(req => req.recipient?._id === targetUser._id);
    if (outgoing) return { context: "outgoing_request", friendshipObj: outgoing };

    // Not friends, no pending request -> context for 'Add Friend' button
    return { context: "search", friendshipObj: null }; 
  };

  // Filter out current user
  const usersToDisplay = React.useMemo(() => 
    allUsers.filter(u => u._id !== currentUser?._id), 
    [allUsers, currentUser]
  );

  return (
    <Card className="p-6">
      <CardTitle className="text-lg font-medium mb-4">Find Friends</CardTitle>
      {/* ... Loading/Error States ... */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {usersToDisplay.map((user) => {
            const { context, friendshipObj } = getFriendshipDetails(user);
            if (!context) return null; // Don't render if no context (e.g., error case)
            return (
               <UserCard
                  key={user._id}
                  profile={user}
                  friendshipContext={context} // Determined context
                  friendshipObj={friendshipObj} // Pass request/user object
               />
            );
          })}
        </div>
      )}
    </Card>
  );
}
export default FindFriends;
```
**Explanation:**
*   `FindFriends` fetches data from four hooks: `useUsers`, `useGetFriends`, `useGetIncomingFriendRequests`, `useGetOutgoingFriendRequests`.
*   It uses `React.useMemo` for performance when deriving lists.
*   The `getFriendshipDetails` function checks the relationship between the `currentUser` and the `targetUser` (friend, incoming request, outgoing request, or none).
*   It returns a `context` string (`'friend'`, `'incoming_request'`, `'outgoing_request'`, `'search'`) and potentially a `friendshipObj` (like the request object).
*   This `context` and `friendshipObj` are passed to `UserCard`, which then passes them to `ActionButton` to render the correct button(s).
*   It filters out the `currentUser` from the displayed list.

## 5. Integrate Components into `HomePage` Tabs

Update `src/pages/HomePage.jsx` to use the `FriendList` and `FindFriends` components in the `PROFILE_TABS` configuration.

```jsx
// src/pages/HomePage.jsx
import React, { useState } from "react";
import useAuth from "@/hooks/useAuth";
// ... other imports (LoadingScreen, Card, Tabs, icons)

// Import components needed for tabs
import Profile from "@/features/user/Profile"; 
import ProfileCover from "@/features/user/ProfileCover";
// *** Import Friend Tab Components ***
import FriendList from "@/features/friend/FriendList"; 
import FindFriends from "@/features/friend/FindFriends.jsx"; // Import the new component

function HomePage() {
  const { user, isInitialized } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");

  if (!isInitialized || !user) { /* ... loading states ... */ }

  // Define the tabs structure with updated friend components
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
      // *** Use FriendList component ***
      component: <FriendList />, 
      label: "Friends"
    },
    {
      value: "find_friends", // New value for the consolidated tab
      icon: <UserPlus className="w-5 h-5" />,
      // *** Use FindFriends component ***
      component: <FindFriends />, 
      label: "Find Friends" // Updated label
    },
    // Removed 'requests' and 'add_friend' tabs
  ];

  return (
    <div className="container mx-auto px-4 pt-4">
      {/* ... Cover Card and Tab Navigation Structure (remains the same) ... */}
      <Card className="mb-6 ...">
        <ProfileCover profile={user} />
        <div className="absolute bottom-0 ...">
          <Tabs value={currentTab} onValueChange={setCurrentTab} ...>
            <TabsList className="...">
              {PROFILE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} ...>
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* ... Tab Content Rendering Structure (remains the same) ... */}
      <Card className="p-4 md:p-6 shadow-sm">
        <Tabs value={currentTab} className="w-full">
          {PROFILE_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
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

## 6. Testing the Friend System Tabs

Run the application (`npm run dev`) and test:

1.  Log in and navigate the tabs on `HomePage`: "Profile", "Friends", "Find Friends".
2.  **Friends Tab:** Verify your friend list appears. Try searching/filtering within the list. Verify the "Unfriend" button works.
3.  **Find Friends Tab:**
    *   Verify the list shows all users *except* yourself.
    *   Check that the correct action button appears for different users:
        *   "Add Friend" for users with no relationship.
        *   "Accept" / "Decline" for users who sent you a request.
        *   "Cancel Request" for users you sent a request to.
        *   "Unfriend" for users who are already your friends (this might appear if the data isn't perfectly synced, but clicking it should work).
    *   Test each action button (Add, Accept, Decline, Cancel, Unfriend) and verify the UI updates correctly (the button should change state, and potentially the user card might update or disappear if requests are handled elsewhere). Check if the "Friends" tab also reflects changes immediately or after a refresh/navigation.

## 7. Frequently Asked Questions (FAQ)

*   **Q: Why use tabs on `HomePage` instead of separate pages?**
    *   A: This approach keeps friend management closely tied to the user's main view, simplifying navigation.
*   **Q: How does the `ActionButton` know which button to show in the "Find Friends" tab?**
    *   A: The `FindFriends` component fetches all necessary relationship data (friends, incoming/outgoing requests). It then determines the correct `friendshipContext` for each user displayed (e.g., `'search'`, `'incoming_request'`, `'friend'`) and passes this context to the `UserCard`, which in turn passes it to the `ActionButton`. `ActionButton` uses this context to render the appropriate button(s).
*   **Q: Will fetching all users/friends/requests in `FindFriends` be slow?**
    *   A: With the mock API and small datasets, it's fast. In a real application with many users, fetching *all* users would be inefficient. Pagination for the `/users` endpoint and potentially for the friends/requests lists would be necessary. The `FindFriends` component would need to be adapted to handle paginated data.

## What's Next?

We have implemented the friend system within the `HomePage` tabs, consolidating finding and managing friends into a single view.

In **Step 8: Summary and Next Steps**, we will review the project and discuss potential future enhancements.