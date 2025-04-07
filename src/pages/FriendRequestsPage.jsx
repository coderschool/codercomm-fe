import React, { useEffect } from "react";
// import { useGetIncomingFriendRequests, useGetOutgoingFriendRequests } from "@/hooks/useFriendQuery";
import { useAppStore } from "@/lib/store";
import FriendCard from "@/features/friend/FriendCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function FriendRequestsPage() {
  // Fetch requests state and action from store
  const { requestsState, fetchFriendRequests } = useAppStore((state) => ({
    requestsState: state.friendRequests,
    fetchFriendRequests: state.fetchFriendRequests,
  }));

  // Fetch requests on mount
  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  // Extract state for easier use
  const incomingRequests = requestsState.incoming ?? [];
  const outgoingRequests = requestsState.outgoing ?? [];
  const isLoading = requestsState.isLoading;
  const error = requestsState.error;

  // Combine requests for rendering, adding context
  const allRequests = [
    ...incomingRequests.map(req => ({ ...req, type: 'incoming' })),
    ...outgoingRequests.map(req => ({ ...req, type: 'outgoing' }))
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Friend Requests</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Pending Requests ({isLoading ? '...' : allRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && allRequests.length === 0 && (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
          )}
          {!isLoading && error && (
            <p className="text-destructive text-sm text-center py-4">Error loading requests: {error}</p>
          )}
          {!isLoading && !error && allRequests.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No pending friend requests.</p>
          )}
          {!isLoading && !error && allRequests.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRequests.map((request) => (
                <FriendCard
                  key={request._id}
                  request={request}
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