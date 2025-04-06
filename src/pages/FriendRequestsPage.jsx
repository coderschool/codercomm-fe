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
                  // The user profile is nested under 'requester' in the API response
                  profile={request.requester} 
                  // Pass the full friendship object which contains status and potentially createdAt
                  friendshipObj={request} 
                  friendshipContext="request" 
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
                  // The user profile is nested under 'recipient' in the API response
                  profile={request.recipient} 
                  friendshipObj={request}
                  friendshipContext="request"
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